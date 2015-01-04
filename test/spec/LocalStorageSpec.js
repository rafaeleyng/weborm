describe('LocalStorage', function() {


  var modelJS;
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
    modelJS = new ModelJS(schema, config);
    storage = modelJS.storage;
    storage.clean();
  });

  afterAll(function() {
    storage.clean();
  });

  it('should be defined', function() {
    expect(storage).toBeDefined();
  });

});
