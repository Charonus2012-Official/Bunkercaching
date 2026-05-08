create table tvrze
(
    id                int auto_increment
        primary key,
    opevneni_id       bigint                       not null,
    name              varchar(100)                 not null,
    zkratka           varchar(5)                   null,
    link              varchar(150)                 not null,
    objects           longtext collate utf8mb4_bin null
        check (json_valid(`objects`)),
    usek              varchar(50)                  null,
    podusek           varchar(50)                  null,
    stav              varchar(50)                  null,
    pocet_objektu     int                          null,
    postaveno_objekty int                          null,
    reseni_vo         varchar(50)                  null,
    osadka            varchar(20)                  null,
    jine_nazvy        varchar(150)                 null,
    latitude          decimal(9, 6)                null,
    longitude         decimal(9, 6)                null,
    constraint opevneni_id
        unique (opevneni_id)
);
