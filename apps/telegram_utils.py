import hmac
import hashlib
import json
from urllib.parse import parse_qsl

def validate_telegram_data(init_data: str, bot_token: str) -> dict | None:
    """
    Validates the initData from Telegram Mini App.
    Returns the parsed user data dictionary if valid, None otherwise.
    """
    if not init_data or not bot_token:
        return None
        
    parsed_data = dict(parse_qsl(init_data))
    if 'hash' not in parsed_data:
        return None
        
    hash_value = parsed_data.pop('hash')
    
    # Sort data pairs alphabetically
    data_check_string = '\n'.join(
        f"{k}={v}" for k, v in sorted(parsed_data.items())
    )
    
    secret_key = hmac.new("WebAppData".encode(), bot_token.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    
    if calculated_hash == hash_value:
        if 'user' in parsed_data:
            return json.loads(parsed_data['user'])
    
    return None
