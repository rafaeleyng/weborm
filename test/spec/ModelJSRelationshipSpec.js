describe('ModelJS', function() {

  var modelJS;
  var storage;
  var schema = {
    _Base: new ModelJS.SchemaEntity(['name']),
    Country: new ModelJS.SchemaEntity(['abbr']),
    State: new ModelJS.SchemaEntity(['abbr'], ['Country']),
    City: new ModelJS.SchemaEntity([], ['State'])
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

});
