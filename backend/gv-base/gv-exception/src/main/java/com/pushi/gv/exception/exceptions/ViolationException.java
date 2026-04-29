package com.pushi.gv.exception.exceptions;

/**
 * 违规异常.
 *
 * @author anj
 */
public class ViolationException extends RuntimeException {
    private static final long serialVersionUID = 1;

    public ViolationException() {
    }

    public ViolationException(String message) {
        super(message);
    }

    public ViolationException(String message, Throwable cause) {
        super(message, cause);
    }

    public ViolationException(Throwable cause) {
        super(cause);
    }
}
