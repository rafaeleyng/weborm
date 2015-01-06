describe('LocalStorage', function() {

  var ENTITY = 'Country';
  var ID = 1;

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

  it('should save object to local storage and create index for the entity', function() {
    expect(localStorage.length).toEqual(0);
    storage.save(ENTITY, {id: ID});
    expect(localStorage.length).toEqual(2);
    expect(localStorage[storage._helpers.genKey(ENTITY, ID)]).toBeDefined();
    var entityIndex = localStorage[ENTITY];
    expect(entityIndex).toBeDefined();
    expect(entityIndex.split('_').length).toEqual(1);
  });

  it('should override objects of same entity with same id when saving', function() {
    expect(localStorage.length).toEqual(0);
    var moreThanOnce = 2;
    for (var i = 0; i < moreThanOnce; i++) {
      storage.save(ENTITY, {id: ID});
    }
    expect(localStorage.length).toEqual(2);
    expect(localStorage[ENTITY].split('_').length).toEqual(1);
  });

  it('shouldn\'t find objects not previously saved', function() {
    expect(storage.find(ENTITY, ID)).toBeUndefined();
  });

  it('should find objects previously saved', function() {
    storage.save(ENTITY, {id: ID});
    expect(storage.find(ENTITY, ID)).toBeDefined();
  });

  it('should find the first object of a given entity', function() {
    storage.save(ENTITY, {id: ID});
    storage.save(ENTITY, {id: ID+1});
    storage.save(ENTITY, {id: ID+2});
    expect(storage.first(ENTITY).id).toEqual(ID);
  });

  it('should count records of a given entity', function() {    
    var aNumberOfRecords = 6;
    for (var i = 0; i < aNumberOfRecords; i++) {
      storage.save(ENTITY, {id: i+1});
    }
    expect(storage.count(ENTITY)).toEqual(aNumberOfRecords);
    expect(storage.count(ENTITY)).toEqual(storage.all(ENTITY).length);    
  });

  it('should retrieve all records of a given entity', function() {    
    var aNumberOfRecords = 10;
    for (var i = 0; i < aNumberOfRecords; i++) {
      storage.save(ENTITY, {id: i+1});
    }
    expect(storage.all(ENTITY).length).toEqual(aNumberOfRecords);
  });

  it('should retrieve any page of the records of a given entity', function() {    
    var pageSize = 5;
    var numberOfPages = 3;
    var someNumberSmallerThanPageSize = pageSize - 1
    var aNumberOfRecords = (pageSize * numberOfPages) - someNumberSmallerThanPageSize;

    for (var i = 0; i < aNumberOfRecords; i++) {
      storage.save(ENTITY, {id: i+1});
    }

    for (var pageNumber = 0; pageNumber < numberOfPages; pageNumber++) {
      if (pageNumber === numberOfPages - 1) {
        expect(storage.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize - someNumberSmallerThanPageSize);
      } else {
        expect(storage.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize);
      }
    }
  });

  it('should filter the records of a given entity by any property', function() {
    storage.save(ENTITY, {id: 1, name: 'Brazil', abbr: 'BR'});
    storage.save(ENTITY, {id: 2, name: 'Brazil', abbr: 'BRA'});
    storage.save(ENTITY, {id: 3, name: 'Peru', abbr: 'PE'});
    expect(storage.count(ENTITY)).toEqual(3);
    expect(storage.filter(ENTITY, function(data) { return data.name === 'Brazil'}).length).toEqual(2);
    expect(storage.filter(ENTITY, function(data) { return data.name === 'Brazil' && data.abbr === 'BR'}).length).toEqual(1);
    expect(storage.filter(ENTITY, function(data) { return data.name === 'Peru'}).length).toEqual(1);
  });

  it('should be able to delete a record', function() {
    storage.save(ENTITY, {id: ID});
    expect(storage.count(ENTITY)).toEqual(1);
    storage.save(ENTITY, {id: ID+1});
    expect(storage.count(ENTITY)).toEqual(2);
    storage.delete(ENTITY, ID);
    expect(storage.count(ENTITY)).toEqual(1);
    storage.delete(ENTITY, ID+1);
    expect(storage.count(ENTITY)).toEqual(0);
  });

});
