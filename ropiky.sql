create table ropiky
(
    id        bigint auto_increment
        primary key,
    ropiky_id bigint               not null,
    vz36      tinyint(1) default 0 null,
    name      varchar(255)         not null,
    sbor      varchar(50)          not null,
    úsek      varchar(150)         not null,
    řop       varchar(100)         null,
    typ       varchar(10)          null,
    odolnost  varchar(50)          null,
    mnm       bigint               null,
    betonáž   varchar(100)         null,
    krychelná varchar(100)         null,
    stav_1938 varchar(30)          null,
    stav_dnes varchar(30)          null,
    latitude  decimal(9, 6)        not null,
    longitude decimal(9, 6)        not null,
    constraint name
        unique (name),
    constraint ropiky_id
        unique (ropiky_id)
)
    collate = utf8mb4_uca1400_ai_ci;

