describe('ModelJS', function() {

  var modelJS;
  var storage;
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

  var ENTITY = 'Country';
  var ID = 1;

  beforeEach(function() {
    modelJS = new ModelJS(schema, config);
    modelJS.storage.clean();
  });

  afterAll(function() {
    modelJS.storage.clean();
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

  it('should tell whether two ModelJS objects reffer to the same record', function() {
    var country1 = modelJS.save('Country', {name: 'Brazil'});
    var country1Found = modelJS.find('Country', country1.id);
    var country2 = modelJS.save('Country', {name: 'Peru'});
    var country2Found = modelJS.find('Country', country2.id);
    var state1 = modelJS.save('State', {name: 'Rio Grande do Sul'});

    expect(modelJS.same(country1, country1Found)).toBeTruthy();
    expect(modelJS.same(country2, country2Found)).toBeTruthy();

    expect(modelJS.same(country1, country2)).toBeFalsy();
    expect(modelJS.same(country1, state1)).toBeFalsy();
  });

  it('should keep objects in context and return always the same instance for a record', function() {
    var country1 = modelJS.save('Country', {name: 'Brazil'});
    var country1Found = modelJS.find('Country', country1.id);
    expect(country1 === country1Found).toEqual(true);
    
    var state1 = modelJS.save('State', {name: 'Rio Grande do Sul'});
    state1.Country = country1;
    state1.save();
    var state1Found = modelJS.find('State', state1.id);
    expect(country1 === state1Found.Country).toEqual(true);
  });

  it('should tell whether two ModelJS objects are equal', function() {
    var brazil = modelJS.save('Country', {name: 'Brazil', abbr: 'BR'});
    var brazil2 = modelJS.save('Country', {name: 'Brazil', abbr: 'BRA'});
    var brasil = modelJS.save('Country', {name: 'Brasil', abbr: 'BR'});
    var sc = modelJS.save('State', {name: 'Santa Catarina'});

    expect(modelJS.equals(brazil, brazil)).toBeTruthy();

    expect(modelJS.equals(brazil, brasil)).toBeFalsy();
    expect(modelJS.equals(brazil, brazil2)).toBeFalsy();
    expect(modelJS.equals(brazil, sc)).toBeFalsy();
    // TODO test relationships?
    // TODO does this 'equals' method really have a point for existing?
  });

  it('should find objects previously saved', function() {
    modelJS.save(ENTITY, {id: ID});
    expect(modelJS.find(ENTITY, ID)).toBeDefined();
  });

  it('should find the first object of a given entity', function() {
    modelJS.save(ENTITY, {id: ID});
    modelJS.save(ENTITY, {id: ID+1});
    modelJS.save(ENTITY, {id: ID+2});
    expect(modelJS.first(ENTITY).id).toEqual(ID);
  });

  it('should count records of a given entity', function() {    
    var aNumberOfRecords = 6;
    for (var i = 0; i < aNumberOfRecords; i++) {
      modelJS.save(ENTITY, {id: i+1});
    }
    expect(modelJS.count(ENTITY)).toEqual(aNumberOfRecords);
    expect(modelJS.count(ENTITY)).toEqual(modelJS.all(ENTITY).length);    
  });

  it('should retrieve all records of a given entity', function() {    
    var aNumberOfRecords = 10;
    for (var i = 0; i < aNumberOfRecords; i++) {
      modelJS.save(ENTITY, {id: i+1});
    }
    expect(modelJS.all(ENTITY).length).toEqual(aNumberOfRecords);
  });

  it('should retrieve any page of the records of a given entity', function() {    
    var pageSize = 5;
    var numberOfPages = 3;
    var someNumberSmallerThanPageSize = pageSize - 1
    var aNumberOfRecords = (pageSize * numberOfPages) - someNumberSmallerThanPageSize;

    for (var i = 0; i < aNumberOfRecords; i++) {
      modelJS.save(ENTITY, {id: i+1});
    }

    for (var pageNumber = 0; pageNumber < numberOfPages; pageNumber++) {
      if (pageNumber === numberOfPages - 1) {
        expect(modelJS.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize - someNumberSmallerThanPageSize);
      } else {
        expect(modelJS.page(ENTITY, pageNumber, pageSize).length).toEqual(pageSize);
      }
    }
  });

  it('should filter the records of a given entity by any property', function() {
    modelJS.save(ENTITY, {id: 1, name: 'Brazil'});
    modelJS.save(ENTITY, {id: 2, name: 'Brazil'});
    modelJS.save(ENTITY, {id: 3, name: 'Peru'});
    expect(modelJS.count(ENTITY)).toEqual(3);
    expect(modelJS.filter(ENTITY, function(data) { return data.name === 'Brazil'}).length).toEqual(2);
    expect(modelJS.filter(ENTITY, function(data) { return data.name === 'Peru'}).length).toEqual(1);
  });

  it('should be able to delete a record', function() {
    modelJS.save(ENTITY, {id: ID});
    expect(modelJS.count(ENTITY)).toEqual(1);
    modelJS.save(ENTITY, {id: ID+1});
    expect(modelJS.count(ENTITY)).toEqual(2);
    modelJS.delete(ENTITY, ID);
    expect(modelJS.count(ENTITY)).toEqual(1);
    modelJS.delete(ENTITY, ID+1);
    expect(modelJS.count(ENTITY)).toEqual(0);
  });

  it('should save a bunch of objects', function() {
    var data = [
      {name: 'Brazil'},
      {name: 'Uruguay'},
      {name: 'Argentina'},
      {name: 'Chile'}
    ];
    var dataLength = data.length;
    var countries = modelJS.save('Country', data);

    expect(countries.length).toEqual(dataLength);
    expect(modelJS.count('Country')).toEqual(dataLength);
    expect(modelJS.all('Country').length).toEqual(dataLength);
  });

});
