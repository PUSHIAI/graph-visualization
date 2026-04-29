package com.pushi.gv.exception.exceptions;

/**
 * Feign调用异常.
 *
 * @author anj
 */
public class FeignException extends RuntimeException {
    private static final long serialVersionUID = 1;

    public FeignException() {
        super();
    }

    public FeignException(String message) {
        super(message);
    }

    public FeignException(String message, Throwable cause) {
        super(message, cause);
    }

    public FeignException(Throwable cause) {
        super(cause);
    }
}
