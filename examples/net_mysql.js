var mysql = require('mysql2');
var Promise = require('bluebird');
var _ = require('lodash');
var connection = mysql.createConnection({
    host: 'bigmac',
    user: 'root',
    password: 'fc24*'
});

var stats = require('@fc24/stats');

var metrics = stats.metrics('bigmac.mysql.');


var query = Promise.promisify(connection.query, {
    context: connection
});

function getDbs() {
    return query('SHOW DATABASES;').map(function(item) {
        return item.Database;
    }).filter(function(item) {
        return item.search('_schema') === -1;
    });
}
function getDbs() {
    return ['sandbox', 'dev', 'stage'];
}
connection.connect();

function getSize(tablename) {
    return {
        tablename: tablename,
        query: `SELECT TABLE_NAME AS "name",
table_rows AS "rows", ROUND( (
data_length + index_length
) /1024, 2 ) AS "size"
FROM information_schema.TABLES
WHERE information_schema.TABLES.table_schema = '${tablename}'
LIMIT 0 , 30`
    };
}

Promise.bind({}).then(getDbs).map(getSize).map(function(item) {
    return query(item.query).map(function(row) {
        var element = {
            db: item.tablename,
            rows: row.rows || 0,
            name: row.name,
            size: row.size
        };

        element.id = element.db + '.' + element.name;
        console.log(element.id, element.rows)
        metrics.gauge(element.id, element.rows);
        return element;
    });
});
/*
 connection.query('SHOW DATABASES;', function(error, result, column) {
 Promise.all(result.map(function(row) {
 var dbName = row[column[0].name];
 return query(getSize(dbName));
 })).then(console.log)
 });
 */
//connection.end();
