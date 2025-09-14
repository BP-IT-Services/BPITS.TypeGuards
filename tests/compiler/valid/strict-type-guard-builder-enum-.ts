import { CommonTypeGuards, StrictTypeGuardBuilder } from "../../../src";

enum UserRole {
    Admin = 1,
    Viewer = 2
}

type User = {
    id: string;
    role: UserRole;
    username: string;
    name: string;
    email: string;
    created: Date;
    modified: Date;
};

const isUser = StrictTypeGuardBuilder
    .start<User>('User')
    .validateProperty('id', CommonTypeGuards.basics.string())
    .validateProperty('role', CommonTypeGuards.enums.memberOf(UserRole))
    .validateProperty('username', CommonTypeGuards.basics.string())
    .validateProperty('name', CommonTypeGuards.basics.string())
    .validateProperty('email', CommonTypeGuards.basics.string())
    .validateProperty('created', CommonTypeGuards.date.date())
    .validateProperty('modified', CommonTypeGuards.date.date())
    .build();
