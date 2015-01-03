'use strict'

var schema = {

	// common to all entities:
	_Base: { 
		attrs: 		['id'],
	}, 

	// entities:	
	Country: { 
		attrs: 		['name', 'abbr'],
	}, 

	State: { 
		attrs: 		['name', 'abbr'], 
		relsToOne:	['Country'],
	},

	City:	{ 
		attrs: 		['name'], 
		relsToOne: 	['State'],
	}
};

var config = {
	base: '_Base',
	storage: 'localStorage', // 'localStorage' is the default, no need to pass it
	pluralization: { // everything that is not pluralized just by adding an 's'
		Country: 'Countries',
		City: 'Cities',
		Address: 'Addresses',
	}
};

var modelJS = new ModelJS(schema, config);
