describe('ModelJS', function() {

  var modelJS;
  var schema = {
    _Base: { 
      attrs: ['id'],
    }, 
    Country: { 
      attrs: ['name', 'abbr'],
    }, 
    State: { 
      attrs: ['name', 'abbr'], 
      relsToOne: ['Country'],
    },
    City: { 
      attrs: ['name'], 
      relsToOne: ['State'],
    }
  };
  var config = {
    pluralization: {
      Country: 'Countries',
      City: 'Cities'
    }
  };

  var cleanLocalStorage = function cleanLocalStorage() {
    for (var key in localStorage) {
      localStorage.removeItem(key);
    }
  };

  beforeEach(function() {
    cleanLocalStorage();
    modelJS = new ModelJS(schema, config);
  });

  afterAll(function() {
    cleanLocalStorage();
  });

  it('should be defined', function() {
    expect(modelJS).toBeDefined();
  });

  it('should create new object', function() {
    var country = modelJS.new('Country', {name: 'country'});
    expect(country).toBeDefined();
  });

  it('should generate an id to a new object', function() {
    var country = modelJS.save('Country', {name: 'country'});
    expect(country.id).toBeDefined();
  });

  it('should save to/read from client storage', function() {
    var savedObject = modelJS.save('Country', { name: 'country'});
    expect(modelJS.find('Country', savedObject.id)).toBeDefined();
  });

  it('should not find object with invalid id', function() {
    var invalidId = -1;
    expect(modelJS.find('Country', invalidId)).toBeUndefined();    
  });

  it('shouldn\'t allow to change the id', function() {
    var country = modelJS.save('Country', {name: 'country'});
    var id = country.id;
    expect(id).toBeDefined();
    country.id = -1;
    expect(country.id).toEqual(id);
  });

  // it('should save a bunch of objects', function() {
  //   modelJS.save(
  //     'Country',
  //     [
  //       {id: 1, name: 'Brasil'},
  //       {id: 3, name: 'Uruguai'},
  //       {id: 2, name: 'Argentina'},
  //       {id: 4, name: 'Chile'}
  //     ]
  //   );
  //   console.log(localStorage);
  // });

});
