describe('WebORM Helpers', function() {

  var weborm;
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
    }
  };
  var config = {
    pluralization: {
      Country: 'Countries'
    }
  };

  beforeAll(function() {
    weborm = new WebORM(schema, config);
  });

  it('should handle pluralization', function() {
    expect(weborm._pluralize('State')).toEqual('States');
    expect(weborm._pluralize('Country')).toEqual('Countries');
  });

  it('should identify the type of an object', function() {
    expect(weborm._typeOf(0)).toEqual('Number');
    expect(weborm._typeOf(NaN)).toEqual('Number');
    expect(weborm._typeOf('')).toEqual('String');
    expect(weborm._typeOf(undefined)).toEqual('Undefined');
    expect(weborm._typeOf(null)).toEqual('Null');
    expect(weborm._typeOf(function(){})).toEqual('Function');
    expect(weborm._typeOf([])).toEqual('Array');
    expect(weborm._typeOf({})).toEqual('Object');
  });

  it('should idenfity collections', function() {
    expect(weborm._isCollection([])).toBeTruthy();
    expect(weborm._isCollection([1,2,3])).toBeTruthy();
    expect(weborm._isCollection(new Array())).toBeTruthy();

    expect(weborm._isCollection({})).toBeFalsy();
    expect(weborm._isCollection(1)).toBeFalsy();
    expect(weborm._isCollection('a')).toBeFalsy();
    expect(weborm._isCollection(null)).toBeFalsy();
    expect(weborm._isCollection(undefined)).toBeFalsy();
  });

  it('should be able to make collections out of both objects and collections', function() {
    expect(weborm._makeCollection(1).length).toEqual(1);
    expect(weborm._makeCollection('a').length).toEqual(1);
    expect(weborm._makeCollection({}).length).toEqual(1);

    expect(weborm._makeCollection([]).length).toEqual(0);
    expect(weborm._makeCollection([1]).length).toEqual(1);
    expect(weborm._makeCollection([1,2,3]).length).toEqual(3);
  });

  it('should lowercase the first letter of a string', function() {
    expect(weborm._lcFirst('ANything')).toEqual('aNything');
    expect(weborm._lcFirst('anything')).toEqual('anything');
  });

  it('should uppercase the first letter of a string', function() {
    expect(weborm._ucFirst('ANything')).toEqual('ANything');
    expect(weborm._ucFirst('anything')).toEqual('Anything');
  });

  it('should generate an unique key for each record based on entity name + id', function() {
    expect(weborm._genKey('Country', 1)).toEqual('Country_1');
  });

  it('should filter data for an object based on its entity schema', function() {
    var dirtyData = {name: 'Brazil', someProperty: 'some value'};
    var filteredData = weborm._filterData('Country', dirtyData);
    expect(filteredData.name).toBeDefined();
    expect(filteredData.someProperty).toBeUndefined();
  });

});
