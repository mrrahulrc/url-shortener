CREATE TABLE urls(
    urlid int auto_increment primary key,
    userid int not null,
    shorturl varchar(128),
    url varchar(255)
);