#!/bin/sh
set -eu
exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers sonpur_clinic
