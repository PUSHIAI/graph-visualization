package com.pushi.gv.graph.entity.graph;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 查询是否存在
 */
@Getter
@Setter
public class ExistModel {

    private List<String> existList;

    private List<String> notExistList;

    @Override
    public int hashCode() {
        int result = existList != null ? existList.hashCode() : 0;
        result = 50 * result + (notExistList != null ? notExistList.hashCode() : 0);
        return result;
    }

    @Override
    public String toString() {
        return "ExistModel{" +
                "existList=" + existList +
                ", notExistList=" + notExistList +
                '}';
    }

    @Override
    public boolean equals(Object obj) {
        if (!(obj instanceof ExistModel)) {
            return false;
        }
        ExistModel existModel = (ExistModel) obj;
        if (this == existModel) {
            return true;
        }
        return existModel.toString().equals(this.toString());
    }
}
