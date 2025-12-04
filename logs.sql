create table logs
(
    id         bigint auto_increment
        primary key,
    log_text   text                                     not null,
    is_closed  tinyint(1)  default 0                    null,
    user_id    bigint                                   null,
    is_concept tinyint(1)  default 0                    null,
    timestamp  datetime(6) default current_timestamp(6) null
);

