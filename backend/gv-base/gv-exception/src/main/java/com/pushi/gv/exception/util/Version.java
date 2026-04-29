package com.pushi.gv.exception.util;

import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 版本表示，支持major.minor
 *
 * @author anj
 */
public class Version implements Comparable<Version> {
    private static final Pattern PATTERN = Pattern.compile("^(\\d+)(\\.(\\d+))?$");

    private final int major;

    private final Integer minor;

    public Version(int major) {
        this(major, null);
    }

    public Version(int major, Integer minor) {
        this.major = major;
        this.minor = minor;
    }

    public static Version parseVersion(String version) {
        if (version != null) {
            Matcher matcher = PATTERN.matcher(version);
            if (matcher.matches()) {
                String g1 = matcher.group(1);
                String g3 = matcher.group(3);
                int major = Integer.parseInt(g1);
                Integer minor = g3 != null ? Integer.parseInt(g3) : null;

                return new Version(major, minor);
            }
        }
        return null;
    }

    @Override
    public int compareTo(Version other) {
        int c = major > other.major ? 1 : major < other.major ? -1 : 0;
        if (c == 0) {
            if (minor != null && other.minor != null) {
                c = minor.compareTo(other.minor);
            } else if (minor != null) {
                c = 1;
            } else if (other.minor != null) {
                c = -1;
            }
        }
        return c;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj != null && getClass() == obj.getClass()) {
            Version other = (Version) obj;
            return major == other.major && Objects.equals(minor, other.minor);
        }
        return false;
    }

    @Override
    public int hashCode() {
        int hash = Integer.hashCode(major);
        hash ^= minor != null ? Integer.hashCode(minor) : 0;
        return hash;
    }

    @Override
    public String toString() {
        String s = "v" + major;
        if (minor != null) {
            s += "." + minor;
        }
        return s;
    }
}
