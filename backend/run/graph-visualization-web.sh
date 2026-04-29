#!/bin/bash

BATCH_DATE=$(date +%Y%m%d)

APP_NAME=graph-visualization-web
APP_JAR_NAME=${APP_NAME}-1.0.0-SNAPSHOT.jar
APP_HOME_PATH=/data/product/app
APP_CODE_PATH=/data/product/code/graph-visualization-web/app-template
GRAPH_VISUALIZATION_WEB_PATH=${APP_HOME_PATH}/${APP_NAME}
LOG_PATH=${APP_HOME_PATH}/applog
BACKUP_PATH=/data/product/backups/${APP_NAME}/${BATCH_DATE}

echo "########### 获取更新"
cd ${APP_CODE_PATH}
CURRENT_BRANCH=$(git branch | awk '{print }')
echo "########### 当前分支为: ${CURRENT_BRANCH}"
git fetch
git pull
if [[ ${?} -ne 0 ]]; then
  echo "###################### 获取更新失败"
  exit 1
fi
echo "########### 更新完成"

echo "########### 开始备份"
if [[ ! -d ${BACKUP_PATH} ]]; then
  mkdir -p ${BACKUP_PATH}
fi

cd ${APP_HOME_PATH}
tar -czvf ${APP_NAME}.tar.gz ${APP_NAME}
if [[ ${?} -ne 0 ]]; then
  echo "###################### 备份失败"
  exit 1
fi

cp ${APP_NAME}.tar.gz ${BACKUP_PATH}
rm ${APP_NAME}.tar.gz
echo "########### 备份完成"

echo "########### 开始编译"
cd ${APP_CODE_PATH}/app-template-pom

mvn clean
mvn install -Dmaven.test.skip=true

cd ${APP_CODE_PATH}

mvn install -Dmaven.test.skip=true

CODE_TARGET_FILE=${APP_CODE_PATH}/app-template-web/${APP_NAME}/target/${APP_JAR_NAME}
if [ -f ${CODE_TARGET_FILE} ]; then
  echo "########### 将 ${CODE_TARGET_FILE} 复制到 ${GRAPH_VISUALIZATION_WEB_PATH}/jars 中"
  cp ${CODE_TARGET_FILE} ${GRAPH_VISUALIZATION_WEB_PATH}/jars
else
  echo "###################### 编译失败"
  exit 1
fi
echo "########### 编译成功"

echo "########### 将复制配置文件到 ${GRAPH_VISUALIZATION_WEB_PATH}/configs"
cp -r ${APP_CODE_PATH}/run/configs/* ${GRAPH_VISUALIZATION_WEB_PATH}/configs
echo "########### 复制配置文件完成"

echo "########### 正在停止服务"
PROCESS=$(ps -ef | grep ${APP_JAR_NAME} | grep -v grep | grep -v PPID | awk '{print $2}')
echo ${PROCESS}
for PID in ${PROCESS}; do
  echo "Kill the process [ ${PID} ]"
  kill -9 ${PID}
done
echo "########### 服务停止成功"

sleep 1s

echo "########### 正在启动程序"

cd ${GRAPH_VISUALIZATION_WEB_PATH}/sbin

if [ ! -d ${LOG_PATH}/${APP_NAME} ]; then
  mkdir -p ${LOG_PATH}/${APP_NAME}
fi

if [ ! -d ${LOG_PATH}/gclog/${APP_NAME} ]; then
  mkdir -p ${LOG_PATH}/gclog/${APP_NAME}
fi

if [ ! -d ${LOG_PATH}/heapdump/${APP_NAME} ]; then
  mkdir -p ${LOG_PATH}/heapdump/${APP_NAME}
fi

if [ ! -d ${APP_HOME_PATH}/tmp/${APP_NAME} ]; then
  mkdir -p ${APP_HOME_PATH}/tmp/${APP_NAME}
fi

nohup java -Xms34m -Xmx512m \
  -Xloggc:${LOG_PATH}/gclog/${APP_NAME}/${APP_NAME}_gc.log \
  -XX:+PrintGCDetails \
  -XX:+PrintGCDateStamps \
  -XX:+UseGCLogFileRotation \
  -XX:NumberOfGCLogFiles=5 \
  -XX:GCLogFileSize=10M \
  -XX:+HeapDumpOnOutOfMemoryError \
  -XX:HeapDumpPath=${LOG_PATH}/heapdump/${APP_NAME} \
  -Dfile.encoding=utf-8 \
  -jar \
  -Dserver.port=8099 \
  -Djava.io.tmpdir=${APP_HOME_PATH}/tmp/${APP_NAME} \
  ${GRAPH_VISUALIZATION_WEB_PATH}/jars/${APP_JAR_NAME} \
  --spring.config.location=${GRAPH_VISUALIZATION_WEB_PATH}/configs/application.yml,${GRAPH_VISUALIZATION_WEB_PATH}/configs/application-config.yml,${GRAPH_VISUALIZATION_WEB_PATH}/configs/application-database.yml \
  >${LOG_PATH}/${APP_NAME}/log.${APP_NAME} 2>&1 &

tailf ${LOG_PATH}/${APP_NAME}/log.${APP_NAME}
