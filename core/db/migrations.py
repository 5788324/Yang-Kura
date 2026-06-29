from .schema import INDEX_STATEMENTS, SCHEMA_STATEMENTS


def initialize_schema(connection):
    connection.execute("PRAGMA foreign_keys = ON;")
    for statement in SCHEMA_STATEMENTS:
        connection.execute(statement)
    for statement in INDEX_STATEMENTS:
        connection.execute(statement)
