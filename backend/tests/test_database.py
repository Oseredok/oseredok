from unittest.mock import MagicMock, patch
from backend.database import get_db

def test_get_db_close_called():
    with patch("backend.database.SessionLocal") as mock_session:
        mock_db = MagicMock()
        mock_session.return_value = mock_db

        gen = get_db()
        db = next(gen)

        assert db is not None

        try:
            next(gen)
        except StopIteration:
            pass

        mock_db.close.assert_called_once()