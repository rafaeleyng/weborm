describe('ModelJS relationships', function() {

  var modelJS;
  var storage;
  var schema = {
    _Base: new ModelJS.SchemaEntity(['name']),
    Country: new ModelJS.SchemaEntity(['abbr']),
    State: new ModelJS.SchemaEntity(['abbr'], ['Country']),
    City: new ModelJS.SchemaEntity([], ['State'], ['Service']),
    Service: new ModelJS.SchemaEntity([])
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
    modelJS = new ModelJS(schema, config);
    modelJS.storage.clean();
  });

  afterAll(function() {
    modelJS.storage.clean();
  });

  it('should persist a relationship', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});
    var rs = modelJS.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});

    expect(rs.Country).toBeDefined();
    expect(rs.countryId).toBeDefined();
  });

  it('should relate two objects when creating a new object passing the relationship id', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});
    var rs = modelJS.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    
    expect(rs.Country).toEqual(brazil);
  });

  it('should relate two objects by setting the relationship id', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});
    var rs = modelJS.save('State', {name:'Rio Grande do Sul'});

    rs.countryId = brazil.id;
    expect(rs.Country).toEqual(brazil);
  });

  it('should relate two objects by setting the relationship object', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});
    var rs = modelJS.save('State', {name:'Rio Grande do Sul'});

    rs.Country = brazil;
    expect(rs.countryId).toEqual(brazil.id);
  });

  it('should hold a single object instantiated for a record, even when used in a relationship', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});
    var rs = modelJS.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var sc = modelJS.save('State', {name:'Santa Catarina', _countryId: brazil.id});

    expect(rs.Country).toEqual(sc.Country);
  });

  it('should maintain a relationship deeper than 1 level', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});
    var rs = modelJS.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var feliz = modelJS.save('City', {name:'Feliz', _stateId: rs.id});

    expect(feliz.State.Country).toEqual(brazil);
  });

  it('should hold a single object instantiated for a record, even when used in a deeper relationship', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});
    var rs = modelJS.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var feliz = modelJS.save('City', {name:'Feliz', _stateId: rs.id});
    var sc = modelJS.save('State', {name:'Santa Catarina', _countryId: brazil.id});
    var florianopolis = modelJS.save('City', {name:'Florianópolis', _stateId: sc.id});

    expect(rs.Country).toEqual(sc.Country);
    expect(rs.Country).toEqual(feliz.State.Country);
    expect(feliz.State.Country).toEqual(florianopolis.State.Country);

    var newCountryName = 'Brasil';
    feliz.State.Country.name = newCountryName;
    expect(florianopolis.State.Country.name).toEqual(newCountryName);
  });

  it('should keep the inverse relationships', function() {
    var brazil = modelJS.save('Country', {name:'Brazil'});

    var rs = modelJS.save('State', {name:'Rio Grande do Sul', _countryId: brazil.id});
    var sc = modelJS.save('State', {name:'Santa Catarina', _countryId: brazil.id});
    expect(brazil.States.length).toEqual(2);

    var feliz = modelJS.save('City', {name:'Feliz', _stateId: rs.id});
    var saoLeopoldo = modelJS.save('City', {name:'São Leopoldo', _stateId: rs.id});
    var portoAlegre = modelJS.save('City', {name:'Porto Alegre', _stateId: rs.id});
    expect(rs.Cities.length).toEqual(3);

    var florianopolis = modelJS.save('City', {name:'Florianópolis', _stateId: sc.id});
    var garopaba = modelJS.save('City', {name:'Garopaba', _stateId: sc.id});
    expect(sc.Cities.length).toEqual(2);
  });

  it('should handle `1 to many` relationships', function() {
    var restaurant = modelJS.save('Service', {name:'Restaurant'});
    var shoppingCenter = modelJS.save('Service', {name:'Shopping Center'});
    var skatepark = modelJS.save('Service', {name:'Skatepark'});

    var feliz = modelJS.save('City', {name:'Feliz', _servicesId:[restaurant.id]});
    expect(feliz.Services.length).toEqual(1);

    var saoLeopoldoServicesIds = [restaurant.id, shoppingCenter.id];
    var saoLeopoldo = modelJS.save('City', {name:'São Leopoldo', _servicesId:saoLeopoldoServicesIds});
    expect(saoLeopoldo.Services.length).toEqual(saoLeopoldoServicesIds.length);

    var portoAlegreServicesIds = [restaurant.id, shoppingCenter.id, skatepark.id];
    var portoAlegre = modelJS.save('City', {name:'Porto Alegre', _servicesId:portoAlegreServicesIds});
    expect(portoAlegre.Services.length).toEqual(portoAlegreServicesIds.length);
  });

  it('should make `1 to many` relationships by setting the relation id', function() {
    var restaurant = modelJS.save('Service', {name:'Restaurant'});
    var feliz = modelJS.save('City', {name:'Feliz', _servicesId:[restaurant.id]});

    expect(feliz.Services[0]).toEqual(restaurant);
  });

  it('should add and remove `1 to many` relationships', function() {
    var restaurant = modelJS.save('Service', {name:'Restaurant'});
    var feliz = modelJS.save('City', {name:'Feliz'});

    expect(feliz.Services.length).toEqual(0);
    modelJS.addTo(restaurant, feliz);
    expect(feliz.Services.length).toEqual(1);
    expect(feliz.Services[0]).toEqual(restaurant);

    modelJS.removeFrom(restaurant, feliz);
    expect(feliz.Services.length).toEqual(0);
    expect(feliz.Services[0]).toBeUndefined();
  });

});
