create table logs
(
    id         bigint auto_increment
        primary key,
    bunker_id int                                       not null,
    type       varchar(2)                               not null,
    log_text   text                                     not null,
    user_id    bigint                                   null,
    is_concept tinyint(1)  default 0                    null,
    timestamp  datetime(6) default current_timestamp(6) null
);

