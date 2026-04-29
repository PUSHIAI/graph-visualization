<!--
 * @Description: 
 * @version: 
 * @Author: shifangwang
 * @Date: 2021-12-10 17:13:12
 * @Feature: 
 * @LastEditors: shifangwang
 * @LastEditTime: 2022-03-25 17:35:08
 * @FilePath: /GraphInsight/src/views/modules/visibleGraph/sidebar/rightSidebar/statistics/index.vue
-->
<template>
    <div class="statistics">
        <div :class="[expandMenu ? 'expand-statistics-menu' : 'statistics-menu']">
            <div 
                v-for="item in statisticsMenu"
                :key="item.value"
                :class="['menu-item', activeStatisticsMenu == item.value ? (!expandAnimation ? 'fold-component' : 'expand-component') : '']"
            >
                <div 
                    @click="changeMenu(item.value)"
                    :class="['menu-title', activeStatisticsMenu == item.value ? 'active-menu' : '']"
                >
                    <svg-icon :iconClass="item.icon" className="menu-icon"></svg-icon>
                    <div class="menu-info">
                        <div class="menu-label">{{item.label}}</div>
                        <div class="menu-desc">{{item.desc}}</div>
                    </div>
                </div>
                <div 
                    class="menu-component" 
                    v-show="activeStatisticsMenu == item.value"
                >
                    <div class="scroll-container">
                        <component
                            :is="item.component"
                            :nodeInGraph="nodeInGraph"
                            :linkInGraph="linkInGraph"
                            @emitEvent="emitEvent"
                        >
                        </component>
                    </div>
                    <div class="toggle-icon-background flex-center" @click="foldMenu">
                        <svg-icon iconClass="graphRightSidebar-toggle-icon" className="toggle-icon"></svg-icon>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props:{
        nodeInGraph:Array,
        linkInGraph:Array
    },
    data() {
        return {
            statisticsMenu: [
                {
                    value: 'basic-statistics',
                    label: '基础统计',
                    icon: 'graphRightSidebar-basic-statistics',
                    desc: '这是一段描述',
                    component: () => import('@/views/modules/visibleGraph/sidebar/rightSidebar/statistics/components/baseStatistics.vue')
                },
                {
                    value: 'filter',
                    label: '过滤',
                    icon: 'graphRightSidebar-filter',
                    desc: '这是一段描述',
                    component: () => import('@/views/modules/visibleGraph/sidebar/rightSidebar/statistics/components/filter.vue')
                },
                // {
                //     value: 'time-wheel',
                //     label: '时间罗盘',
                //     icon: 'graphRightSidebar-time-wheel',
                //     desc: '这是一段描述',
                //     component: () => import('@/views/modules/visibleGraph/sidebar/rightSidebar/statistics/components/timeWheel.vue')
                // },
                // {
                //     value: 'customize-analysis',
                //     label: '自定义分析',
                //     icon: 'graphRightSidebar-customize-analysis',
                //     desc: '这是一段描述',
                //     component: () => import('@/views/modules/visibleGraph/sidebar/rightSidebar/statistics/components/customizeAnalysis.vue')
                // },
            ],
            activeStatisticsMenu: '',
            expandMenu: false,
            expandAnimation: false
        }
    },
    computed: {
    },
    methods: {
        changeMenu(menu) {
            if (!this.activeStatisticsMenu) {
                this.activeStatisticsMenu = menu;
                this.expandMenu = true;
                setTimeout(() => {
                    this.expandAnimation = true;
                }, 600)
            } else if (this.activeStatisticsMenu != menu) {
                this.expandAnimation = false;
                setTimeout(() => {
                    this.activeStatisticsMenu = menu;
                    requestAnimationFrame(() => {
                        this.expandAnimation = true;
                    })
                }, 600)
            } else {
                this.foldMenu();
            }
        },
        // 折叠面板
        foldMenu() {
            this.expandAnimation = false;
            setTimeout(() => {
                this.expandMenu = false;
                this.activeStatisticsMenu = '';
            }, 600)
        },
        emitEvent(event, params) {
            this.$emit("emitEvent", event, params);
        }
    }
}
</script>

<style lang="less" scoped>
.statistics {
    height: 100%;
    .statistics-menu {
        .menu-item {
            .menu-title {
                border-radius: 6px;
                background: #F6F6F9;
                margin: 0 18px 14px 18px;
                padding: 10px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                transition: all 0.6s;
                &:hover {
                    background: #ECF5FF;
                    .menu-info {
                        .menu-label {
                            color: #0D86FF;
                            font-weight: bold;
                        }
                        .menu-desc {
                            color: rgba(13, 134, 255, 0.64);
                        }
                    }
                    .menu-icon {
                        fill: #0D86FF;
                    }
                }
                .menu-icon {
                    width: 24px;
                    height: 24px;
                    fill: #142D54;
                    margin: 0 15px 0 0;
                    transition: all 0.6s;
                }
                .menu-info {
                    flex: 1;
                    font-size: 12px;
                    .menu-label {
                        color: #142D54;
                        transition: all 0.6s;
                    }
                    .menu-desc {
                        color: rgba(4, 12, 21, 0.64);
                        height: 17px;
                        transition: all 0.6s;
                        display:none;
                    }
                }
            }
        }
    }
    .expand-statistics-menu {
        height: 100%;
        display: flex;
        flex-direction: column;
        .menu-item {
            display: flex;
            flex-direction: column;
            transition: all 0.6s;
            .menu-title {
                border-radius: 16px;
                background: #F6F6F9;
                margin: 0 18px 8px 18px;
                padding: 8px 16px;
                cursor: pointer;
                transition: all 1s;
                display: flex;
                align-items: center;
                .menu-icon {
                    width: 16px;
                    height: 16px;
                    fill: #142D54;
                    margin: 0 15px 0 0;
                    transition: all 0.6s;
                }
                .menu-info {
                    flex: 1;
                    font-size: 12px;
                    font-weight: bold;
                    .menu-label {
                        color: #142D54;
                        transition: all 0.6s;
                    }
                    .menu-desc {
                        color: rgba(4, 12, 21, 0.64);
                        opacity: 0;
                        height: 0;
                        transition: all 0.6s;
                    }
                }
            }
            .menu-title:hover, .active-menu {
                background: #ECF5FF;
                .menu-info {
                    .menu-label {
                        color: #0D86FF;
                        font-weight: bold;
                    }
                    .menu-desc {
                        color: rgba(13, 134, 255, 0.64);
                    }
                }
                .menu-icon {
                    fill: #0D86FF;
                }
            }
            .menu-component {
                position: relative;
                margin: 0 18px 30px;
                padding: 0 0 10px 0;
                border-bottom: 1px solid #D0D9E2;
                height: 0;
                transition: all 1s;
                .toggle-icon-background {
                    position: absolute;
                    left: 50%;
                    transform: translate(-50%, 0);
                    bottom: -13px;
                    width: 26px;
                    height: 26px;
                    border-radius: 50%;
                    box-shadow: 0 0 6px rgba(0, 118, 255, 0.16);
                    background: #fff;
                    cursor: pointer;
                    .toggle-icon {
                        width: 14px;
                        height: 8px;
                        fill: #778396;
                    }
                }
                display: flex;
                flex-direction: column;
                .scroll-container {
                    overflow: overlay;
                    flex: 1;
                    margin: 0 -18px;
                }
            }
        }
        .fold-component {
            height: 53px;
            overflow: hidden;
            .menu-component {
                opacity: 0;
            }
        }
        .expand-component {
            height: 100%;
            overflow: hidden;
            .menu-component {
                // height: 100%;
                opacity: 1;
                flex: 1;
            }
        }
    }
}
</style>