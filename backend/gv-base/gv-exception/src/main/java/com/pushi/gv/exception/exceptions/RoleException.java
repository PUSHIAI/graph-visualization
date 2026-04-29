package com.pushi.gv.exception.exceptions;

/**
 * 权限异常
 *
 * @author anj
 */
public class RoleException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public RoleException() {
        super();
    }

    public RoleException(String message) {
        super(message);
    }

    public RoleException(String message, Throwable cause) {
        super(message, cause);
    }

    public RoleException(Throwable cause) {
        super(cause);
    }
}
