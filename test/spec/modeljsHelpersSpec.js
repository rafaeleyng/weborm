describe('ModelJS Helpers', function() {

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
    }
  };
  var config = {
    pluralization: {
      Country: 'Countries'
    }
  };

  beforeAll(function() {
    modelJS = new ModelJS(schema, config);
  });

  it('should handle pluralization', function() {
    expect(modelJS._pluralize('State')).toEqual('States');
    expect(modelJS._pluralize('Country')).toEqual('Countries');
  });

  it('should identify the type of an object', function() {
    expect(modelJS._typeOf(0)).toEqual('Number');
    expect(modelJS._typeOf(NaN)).toEqual('Number');
    expect(modelJS._typeOf('')).toEqual('String');
    expect(modelJS._typeOf(undefined)).toEqual('Undefined');
    expect(modelJS._typeOf(null)).toEqual('Null');
    expect(modelJS._typeOf(function(){})).toEqual('Function');
    expect(modelJS._typeOf([])).toEqual('Array');
    expect(modelJS._typeOf({})).toEqual('Object');
  });

  it('should idenfity collections', function() {
    expect(modelJS._isCollection([])).toBeTruthy();
    expect(modelJS._isCollection([1,2,3])).toBeTruthy();
    expect(modelJS._isCollection(new Array())).toBeTruthy();

    expect(modelJS._isCollection({})).toBeFalsy();
    expect(modelJS._isCollection(1)).toBeFalsy();
    expect(modelJS._isCollection('a')).toBeFalsy();
    expect(modelJS._isCollection(null)).toBeFalsy();
    expect(modelJS._isCollection(undefined)).toBeFalsy();
  });

  it('should be able to make collections out of both objects and collections', function() {
    expect(modelJS._makeCollection(1).length).toEqual(1);
    expect(modelJS._makeCollection('a').length).toEqual(1);
    expect(modelJS._makeCollection({}).length).toEqual(1);

    expect(modelJS._makeCollection([]).length).toEqual(0);
    expect(modelJS._makeCollection([1]).length).toEqual(1);
    expect(modelJS._makeCollection([1,2,3]).length).toEqual(3);
  });

  it('should lowercase the first letter of a string', function() {
    expect(modelJS._lcFirst('ANything')).toEqual('aNything');
    expect(modelJS._lcFirst('anything')).toEqual('anything');
  });

  it('should generate an unique key for each record based on entity name + id', function() {
    expect(modelJS._genKey('Country', 1)).toEqual('Country_1');
  });

  it('should filter data for an object based on its entity schema', function() {
    var dirtyData = {name: 'Brazil', someProperty: 'some value'};
    var filteredData = modelJS._filterData('Country', dirtyData);
    expect(filteredData.name).toBeDefined();
    expect(filteredData.someProperty).toBeUndefined();
  });

});
