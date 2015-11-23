describe('WebORM relationships', function() {

  var weborm;
  var storage;
  var schema = {
    _Base: {
      attrs: ['name']
    },
    Country: {
      attrs: ['abbr']
    },
    State: {
      attrs: ['abbr'],
      relsToOne: ['Country']
    },
    City: {
      relsToOne: ['State'],
      relsToMany: ['Service']
    },
    Service: {}
  };
  
  var config = {
    pluralization: {
      Country: 'Countries',
      City: 'Cities'
    }
  };

  var ENTITY = 'Country';
  var ID = 1;

  beforeEach(function() {
    weborm = new WebORM(schema, config);
    weborm.storage.clean();
  });

  afterAll(function() {
    weborm.storage.clean();
  });

  it('should persist a relationship', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});
    var rs = weborm.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});

    expect(rs.Country).toBeDefined();
    expect(rs.countryId).toBeDefined();
  });

  it('should relate two objects when creating a new object passing the relationship id', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});
    var rs = weborm.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    
    expect(rs.Country).toEqual(brazil);
  });

  it('should relate two objects by setting the relationship id', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});
    var rs = weborm.save('State', {name:'Rio Grande do Sul'});

    rs.countryId = brazil.id;
    expect(rs.Country).toEqual(brazil);
  });

  it('should relate two objects by setting the relationship object', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});
    var rs = weborm.save('State', {name:'Rio Grande do Sul'});

    rs.Country = brazil;
    expect(rs.countryId).toEqual(brazil.id);
  });

  it('should hold a single object instantiated for a record, even when used in a relationship', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});
    var rs = weborm.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var sc = weborm.save('State', {name:'Santa Catarina', _countryId: brazil.id});

    expect(rs.Country).toEqual(sc.Country);
  });

  it('should maintain a relationship deeper than 1 level', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});
    var rs = weborm.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var feliz = weborm.save('City', {name:'Feliz', _stateId: rs.id});

    expect(feliz.State.Country).toEqual(brazil);
  });

  it('should hold a single object instantiated for a record, even when used in a deeper relationship', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});
    var rs = weborm.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var feliz = weborm.save('City', {name:'Feliz', _stateId: rs.id});
    var sc = weborm.save('State', {name:'Santa Catarina', _countryId: brazil.id});
    var florianopolis = weborm.save('City', {name:'Florianópolis', _stateId: sc.id});

    expect(rs.Country).toEqual(sc.Country);
    expect(rs.Country).toEqual(feliz.State.Country);
    expect(feliz.State.Country).toEqual(florianopolis.State.Country);

    var newCountryName = 'Brasil';
    feliz.State.Country.name = newCountryName;
    expect(florianopolis.State.Country.name).toEqual(newCountryName);
  });

  it('should keep the inverse relationships', function() {
    var brazil = weborm.save('Country', {name:'Brazil'});

    var rs = weborm.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var sc = weborm.save('State', {name:'Santa Catarina', _countryId: brazil.id});
    expect(brazil.States.length).toEqual(2);

    var feliz = weborm.save('City', {name:'Feliz', _stateId: rs.id});
    var saoLeopoldo = weborm.save('City', {name:'São Leopoldo', _stateId: rs.id});
    var portoAlegre = weborm.save('City', {name:'Porto Alegre', _stateId: rs.id});
    expect(rs.Cities.length).toEqual(3);

    var florianopolis = weborm.save('City', {name:'Florianópolis', _stateId: sc.id});
    var garopaba = weborm.save('City', {name:'Garopaba', _stateId: sc.id});
    expect(sc.Cities.length).toEqual(2);
  });

  it('should handle `1 to many` relationships', function() {
    var restaurant = weborm.save('Service', {name:'Restaurant'});
    var shoppingCenter = weborm.save('Service', {name:'Shopping Center'});
    var skatepark = weborm.save('Service', {name:'Skatepark'});

    var feliz = weborm.save('City', {name:'Feliz', _servicesId:[restaurant.id]});
    expect(feliz.Services.length).toEqual(1);

    var saoLeopoldoServicesIds = [restaurant.id, shoppingCenter.id];
    var saoLeopoldo = weborm.save('City', {name:'São Leopoldo', _servicesId:saoLeopoldoServicesIds});
    expect(saoLeopoldo.Services.length).toEqual(saoLeopoldoServicesIds.length);

    var portoAlegreServicesIds = [restaurant.id, shoppingCenter.id, skatepark.id];
    var portoAlegre = weborm.save('City', {name:'Porto Alegre', _servicesId:portoAlegreServicesIds});
    expect(portoAlegre.Services.length).toEqual(portoAlegreServicesIds.length);
  });

  it('should make `1 to many` relationships by setting the relation id', function() {
    var restaurant = weborm.save('Service', {name:'Restaurant'});
    var feliz = weborm.save('City', {name:'Feliz', _servicesId:[restaurant.id]});

    expect(feliz.Services[0]).toEqual(restaurant);
  });

  it('should add and remove `1 to many` relationships', function() {
    var restaurant = weborm.save('Service', {name:'Restaurant'});
    var feliz = weborm.save('City', {name:'Feliz'});

    expect(feliz.Services.length).toEqual(0);
    weborm.addTo(restaurant, feliz);
    expect(feliz.Services.length).toEqual(1);
    expect(feliz.Services[0]).toEqual(restaurant);

    weborm.removeFrom(restaurant, feliz);
    expect(feliz.Services.length).toEqual(0);
    expect(feliz.Services[0]).toBeUndefined();
  });

});
