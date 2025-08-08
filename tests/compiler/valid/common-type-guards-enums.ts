import { CommonTypeGuards, StrictTypeGuardBuilder } from "../../../src";

enum UserRole {
    Administrator = 1,
    Moderator = 2,
    Editor = 3,
    Viewer = 4
}

type User = {
    name: string;
    role: UserRole;
}

const isUser = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('name', CommonTypeGuards.basics.string())
    .validateProperty('role', CommonTypeGuards.enums.memberOf(UserRole))
    .build();