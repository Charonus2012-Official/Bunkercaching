create table bunkry
(
    id          bigint auto_increment
        primary key,
    opevneni_id bigint               not null,
    name        varchar(128)         not null,
    secret_name varchar(128)         not null,
    website     varchar(512)         not null,
    state       varchar(64),
    museum      tinyint(1) default 0 not null,
    latitude    decimal(9, 6)        not null,
    longitude   decimal(9, 6)        not null,
    constraint name
        unique (name),
    constraint opevneni_id
        unique (opevneni_id)
);

