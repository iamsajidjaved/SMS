<?PHP 

class WebSMS{
    private static $app_id = null;
	private static $api_key = null;
		
    private static $default_notification_title = 'Request to send SMS!';
	private static $default_notification_body = 'A request has been received from you server to send an sms to ';
	private static $default_segnment = 'All'; // Active Users , All , Inactive Users, Engaged Users
	private static $default_ttl = "259,200";  // Message can be sent in three days
	private static $instance = null;
	public static function to($segnment){
			self::$default_segnment = $segnment;
			return self::getInstance();
	}


	public static function setApp($client_key,$server_key){
		self::$app_id = $client_key;
		self::$api_key = $server_key;
		return self::getInstance();
	}

	public static function setTTL($seconds="259,200"){
		self::$default_ttl = $seconds;
		return self::getInstance();
}

    public static function send($address,$body,$notification_title=null,$notification_body=null){
				if(self::$app_id == null || self::$api_key ==null){
							return self::setError('Please set api key first.');
				}
				if(gettype($address) != 'string' && gettype($address) != 'array'){
					return self::setError('The address field must be string or array.');
				}
				$type = 'SINGLE';
				if(gettype($address) == 'array'){
					$type = 'MULTIPLE';
					$address = implode(',',$address);
				}
				if($notification_title == null){
					$notification_title = self::$default_notification_title;
				}
				if($notification_body == null){
					if($type=='SINGLE'){
						$notification_body = self::$default_notification_body.$address;
					}else{
						$notification_body = self::$default_notification_body.' multiple users.';
					}					
				}
				
			$message = [
				'app_id' => self::$app_id,
				'included_segments' => array(self::$default_segnment), 
				'data' => array(
					"address" => $address,
					'type' => $type,
					'body' => $body,
                    'token' => '__nerds!nn__web_sms'
				),
				"ttl" => self::$default_ttl,
				"headings" => array(
					'en' => $notification_title
				),
				"contents" => array(
					'en' => $notification_body
				)
			];
      
		
		$response = self::_send($message);
		if(property_exists($response,'id') && property_exists($response,'recipients')){
				return $response;
		}
		if(property_exists($response,'errors')){
			$error_message = "";
			if(is_array($response->errors) && isset($response->errors[0])){
				$error_message = $response->errors[0];
			}else{
				$error_message = $response->errors;
			}
			return self::setError($error_message);
		}
		return false;

		}

		private static function setInstance()
    {
        self::$instance = new static();
    }

		
		private static function getInstance()
    {
        if(empty(self::$instance) || self::$instance === null)
        {
            self::setInstance();
        }

        return self::$instance;
    }


		private static function setError($error_message){
			return [
				'error' => [
					'message' => $error_message,
					'code' => 415
				]
			];
		}
		private static function _send($message){
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
			curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8',
														 'Authorization: Basic '.self::$api_key));
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
			curl_setopt($ch, CURLOPT_HEADER, FALSE);
			curl_setopt($ch, CURLOPT_POST, TRUE);
			curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
			curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	
			$response = json_decode(curl_exec($ch));
			curl_close($ch);
			return $response;
		}
}

?>