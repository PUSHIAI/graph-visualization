package com.pushi.gv.graph.exceptions;

/**
 * 连接异常.
 *
 * @author anj
 */
public class GraphConnectException extends RuntimeException {
    private static final long serialVersionUID = 1;

    public GraphConnectException() {
        super();
    }

    public GraphConnectException(String message) {
        super(message);
    }

    public GraphConnectException(String message, Throwable cause) {
        super(message, cause);
    }

    public GraphConnectException(Throwable cause) {
        super(cause);
    }
}
