create table if not exists movie(
    id serial primary key ,
    title varchar(255),
    release_date varchar(255),
    poster_path varchar(255),
    overview varchar(500),
    comments varchar(255)
)
