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
    expect(modelJS).not.toBeUndefined();
  });

  it('should create new object', function() {
    var country = modelJS.new('Country', {name: 'country'});
    expect(country).not.toBeUndefined();
  });

  it('should set id to new object', function() {
    var country = modelJS.new('Country', {name: 'country'});
    expect(country.id).not.toBeUndefined();
  });

  it('should save to/read from client storage', function() {
    var country = modelJS.new('Country', {name: 'country'});
    expect(modelJS.find('Country', country.id)).not.toBeUndefined();
  });

  it('should not find object with invalid id', function() {
    // console.log(localStorage);
    // var invalidId = -1;
    // var test = modelJS.find('Country', invalidId);
    // console.log(test)
    // expect().not.toBeUndefined();    
    // console.log(localStorage);
  });



});
