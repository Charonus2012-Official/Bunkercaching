-- auto-generated definition
create table ropiky
(
    id        bigint auto_increment
        primary key,
    name      varchar(255)         not null,
    web       varchar(500)         not null,
    museum    tinyint(1) default 0 not null,
    latitude  decimal(9, 6)        not null,
    longitude decimal(9, 6)        not null,
    constraint name
        unique (name),
    constraint web
        unique (web)
);

