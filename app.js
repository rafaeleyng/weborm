'use strict'

var schema = {

	// common to all entities:
	_Base: { 
		attrs: 		['id'],
	}, 

	// entities:
	Question: { 
		attrs: 		['text'],
	},
	
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
	},

	Address: { 
		attrs: 		['street', 'number', 'district', 'complement', 'zip'], 
		relsToOne:  ['City'],
	},

	Seller: { 
		attrs: 		['name'], 
		relsToOne: 	['Customer'],
	},

	Customer: { 
		attrs: 		['name', 'registry', 'phone'], 
		relsToOne: 	['Address', 'CustomerType', 'CustomerCategory'],
		relsToMany: ['Quadrant','Segment'],
	},

	Visit: { 
		attrs: 		['date', 'observations', 'status'], 
		relsToOne: 	['Customer', 'Seller', 'Loss'],
	},

	Loss: {
		attrs: 		['date', 'quantity', 'observations'],
		relsToOne:  ['LossReason'],
	},

	LossReason: {
		attrs: 		['text'],
	},

	// types, categories, status etc
	CustomerType: { 
		attrs: 		['name'], 
	},

	CustomerCategory: { 
		attrs: 		['name'], 
	},

	Segment: {
		attrs: 		['name'],
	},

	Quadrant: {
		attrs: 		['name', 'abbr'],
	},
};

var modelJSConfig = {
	base: '_Base',

	storage: storages.localStorage,
	
	pluralization: {
		Country: 'Countries',
		City: 'Cities',
		Address: 'Addresses',
	},
};

var model = new ModelJS(schema, modelJSConfig);
