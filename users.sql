create table users
(
    id          int auto_increment
        primary key,
    username    varchar(50)                             not null,
    email       varchar(100)                            not null,
    pwd         varchar(255)                            not null,
    created_at  timestamp   default current_timestamp() null,
    is_active   tinyint(1)  default 1                   null,
    role        varchar(50) default 'user'              null,
    profile_pic varchar(255)                            null,
    constraint email
        unique (email),
    constraint username
        unique (username)
)