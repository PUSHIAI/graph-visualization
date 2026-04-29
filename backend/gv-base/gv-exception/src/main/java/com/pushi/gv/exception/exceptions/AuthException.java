package com.pushi.gv.exception.exceptions;

/**
 * 登录异常
 *
 * @author anj
 */
public class AuthException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public AuthException() {
        super();
    }

    public AuthException(String message) {
        super(message);
    }

    public AuthException(String message, Throwable cause) {
        super(message, cause);
    }

    public AuthException(Throwable cause) {
        super(cause);
    }
}
