describe('LocalStorage Helpers', function() {


  var weborm;
  var storage;
  var schema = {
    _Base: { 
      attrs: ['id'],
    }, 
    Country: { 
      attrs: ['name', 'abbr'],
    }
  };
  var config = {
    pluralization: {
      Country: 'Countries'
    }
  };

  beforeEach(function() {
    weborm = new WebORM(schema, config);
    storage = weborm.storage;
    storage.clean();
  });

  afterAll(function() {
    storage.clean();
  });

  it('should be able to clean localStorage', function() {
    localStorage.setItem('someKey', 'someValue');
    expect(localStorage.length).toEqual(1);
    storage.clean();
    expect(localStorage.length).toEqual(0);
  });

  it('should generate an unique key for each record based on entity name + id', function() {
    expect(storage._helpers.genKey('Country', 1)).toEqual('Country_1');
  });

});
