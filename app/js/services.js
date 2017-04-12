/*! InfiSpector - v0.0.1 - 2017-04-12
 * https://github.com/infinispan/infispector/
 * Copyright (c) 2017 ;
 * Licensed 
 */
app.factory('messagesService', function() {
	'use strict';
	return {
		messages: {
			"Bad Password" : "Login Failed. Incorrect user or password. Please try again.",
			"login": "I want to login instead",
			"register": "I'm not registered!",
			"registerSuccess": " was created successfully",
			"alreadyRegistered": " is already registered!"		
		}
	};
});
