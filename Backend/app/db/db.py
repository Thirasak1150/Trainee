from psycopg2.extras import RealDictCursor
import psycopg2


def get_db_connection():
    SQLALCHEMY_DATABASE_URL = "postgresql://postgres:Plankton273855@localhost:5432/fusionpbx"

    return psycopg2.connect(
        host="host.docker.internal",  # เปลี่ยนเป็น host.docker.internal
        database="fusionpbx",
        user="postgres",
        password="Plankton273855",
        cursor_factory=RealDictCursor
    )