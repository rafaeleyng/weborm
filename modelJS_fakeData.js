'use strict';

var fakeData = {
	storages: require('./modelJS_storages'),

	cleanStorage: function(storage) {
		console.log('cleaning', storage);

		if (storage === this.storages.localStorage) {
			this._cleanLocalStorage();
		} else if (storage === this.storages.webSQL) {
			this._cleanWebSQL();
		} else if (storage === this.storages.indexedDB) {
			this._cleanIndexedDB();
		}				
	},

	_cleanLocalStorage: function() {
		for (var key in localStorage) {
			localStorage.removeItem(key);
		}
	},

	_cleanWebSQL: function() { },

	_cleanIndexedDB: function() {	},

	createFakeData: function(model) {
		model.save(
			'Question', 
			[
			{id: 1, text: 'Houve alteração nos dados do cliente?' },
			{id: 2, text: 'Houve intenção de compra?' },
			{id: 3, text: 'Houve perda?' },
			{id: 4, text: 'O cliente reclamou de algum produto?' },
			{id: 5, text: 'Houve participação do regional?' },
			{id: 6, text: 'Houve alteração na frota?'},
			{id: 7, text: 'Deseja agendar atualização de frota?' },
			]
			);

		model.save('Country', {id: 1, name: 'Brasil'});
		model.save(
			'Country',
			[
			{id: 3, name: 'Uruguai'},
			{id: 2, name: 'Argentina'},
			{id: 4, name: 'Chile'},
			]
			);

		model.save(
			'State',
			[
			{id: 2, name:'Santa Catarina', _countryId:1},
			{id: 1, name:'Rio Grande do Sul', _countryId:1},
			{id: 7, name:'Rio Grande do Norte', _countryId:1},
			{id: 3, name:'Buenos Aires', _countryId:2},
			{id: 4, name:'Santa Fe', _countryId:2},
			{id: 5, name:'Maldonado', _countryId:3},
			{id: 6, name:'Canelones', _countryId:3},
			]
			);

		model.save(
			'City',
			[
			{id: 2, name:'São Leopoldo', _stateId: 1},
			{id: 3, name:'Piratini', _stateId: 1},
			{id: 4, name:'Bom Jesus', _stateId: 1},
			{id: 5, name:'Gravataí', _stateId: 1},
			{id: 1, name:'Porto Alegre', _stateId: 1},
			{id: 16, name:'Santo Antônio da Patrulha', _stateId: 1},
			{id: 6, name:'Florianópolis', _stateId: 2},
			{id: 7, name:'Lajes', _stateId: 2},
			{id: 8, name:'Buenos Aires', _stateId: 3},
			{id: 9, name:'Quilmes', _stateId: 3},
			{id: 10, name:'Rosario', _stateId: 4},
			{id: 11, name:'Santa Fe', _stateId: 4},
			{id: 12, name:'San Carlos', _stateId: 5},
			{id: 13, name:'Maldonado', _stateId: 5},
			{id: 14, name:'Las Piedras', _stateId: 6},
			{id: 15, name:'Ciudad de la Costa', _stateId: 6},
			]
			);

		model.save(
			'Address',
			[
			{id: 1, street: 'Rua Governador Alcantara Neves', number: '123', district: 'Centro', complement: 'Frente', zip: '98765432', _cityId: 3},
			{id: 2, street: 'Rua Presidente Vargas', number: '332', district: 'Centro', complement: 'Casa', zip: '98798798', _cityId: 5},
			{id: 5, street: 'Rua Presidente Lucena', number: '123', district: 'Centro', complement: '', zip: '78978978', _cityId: 4},
			{id: 3, street: 'Rua Bento Gonçalves', number: '345', district: 'Partenon', complement: 'Loja B', zip: '98798765', _cityId: 1},
			]
			);

		model.save(
			'Seller',
			[
			{id: 1, name: 'Vendedor João'},
			{id: 2, name: 'Vendedor Ronaldo'},
			{id: 3, name: 'Vendedor Bira'},
			]
			);

		model.save(
			'CustomerType',
			[
			{id: 0, name: 'Jurídica'},
			{id: 1, name: 'Pública'},
			{id: 2, name: 'Física'},
			]
			);	

		model.save(
			'CustomerCategory',
			[
			{id: 0, name: 'Cliente Prospect'},
			{id: 1, name: 'Cliente Final'},
			]
			);		

		model.save(
			'Segment',
			[
			{id: 0, name: 'CFC'},
			{id: 1, name: 'Escolar'},
			{id: 2, name: 'Fretamento'},
			{id: 3, name: 'Infraestrutura'},
			{id: 4, name: 'Turismo'},
			{id: 5, name: 'Urbano'},
			{id: 6, name: 'Uso Próprio'},
			]
			);

		model.save(
			'Quadrant',
			[
			{id:0, name: 'Blindagem', abbr:'B'},
			{id:1, name: 'Commodity', abbr:'C'},
			{id:2, name: 'Estratégico', abbr:'E'},
			{id:3, name: 'Novos Clientes', abbr:'N'},
			]
			);

		model.save(
			'Customer',
			[
				{
					id: 1, name: 'Prefeitura Municipal de Piratini', registry: '55582434000139', phone: '5165498756', 
					_addressId: 1, _customerTypeId: 1, _quadrantsId: [0,1,2,3],
				},
				{
					id: 2,name: 'Joaozinho Turismo', registry: '38121281000', phone: '51651491111',
				 	_addressId: 2, _customerTypeId: 2, _quadrantsId: [0,1,2],
				},
				{
					id: 3, name: 'Prefeitura Municipal de Bom Jesus', registry: '86229972000178', phone: '5165492222',
				 	_addressId: 5, _customerTypeId: 1, _quadrantsId: [0,3],
				},
				{
					id: 4, name: 'TransPOA', registry: '65600128000131', phone: '5165493333',
				 	_addressId: 3, _customerTypeId: 0, _quadrantsId: [2],
				},
			]
			);

		model.save(
			'Visit',
			[
			{id: 1, date: '02/09/2014', status: 1, observations: '', _customerId: 1, _sellerId: 1},
			{id: 2, date: '03/09/2014', status: 0, observations: '', _customerId: 2, _sellerId: 2},
			{id: 3, date: '03/09/2014', status: 2, observations: '', _customerId: 3, _sellerId: 3},
			{id: 4, date: '03/09/2014', status: 0, observations: '', _customerId: 4, _sellerId: 1},
			{id: 5, date: '04/09/2014', status: 1, observations: '', _customerId: 1, _sellerId: 2},
			{id: 6, date: '04/09/2014', status: 2, observations: '', _customerId: 2, _sellerId: 3},
			{id: 7, date: '05/09/2014', status: 1, observations: '', _customerId: 3, _sellerId: 1},
			{id: 8, date: '05/09/2014', status: 2, observations: '', _customerId: 4, _sellerId: 2},
			]
			);


		model.save(
			'LossReason',
			[
            {id:0, text: 'Preço muito alto'},
            {id:1, text: 'Condição de pagamento ruim'},
            ]
			);

		console.log('DONE creating fake data');

	},
};
