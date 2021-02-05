import { i18n } from '../../boot/i18n';
import store from '../../store';

let unitConverterCache = {};

function resetUnitConverterCache() {
  unitConverterCache = {};
}

function Unit(id, name, nameLocale, symbol, unitCategoryID, isSystemUnit) {
  this.id = id;
  this.name = name;
  this.nameLocale = nameLocale;
  this.symbol = symbol;
  this.isSystemUnit = isSystemUnit;
  this.unitCategoryID = unitCategoryID;
}

function UnitCategory(id, name, nameLocale) {
  this.id = id;
  this.name = name;
  this.nameLocale = nameLocale;
}

function UnitContext(id, name, nameLocale, unitCategoryID) {
  this.id = id;
  this.name = name;
  this.nameLocale = nameLocale;
  this.unitCategoryID = unitCategoryID;
}

function isNativeUnitSystem(nativeUnit) {
  return nativeUnit.scale === 1 && nativeUnit.offset === 0;
}

function createUnitFromNativeUnit(nativeUnit) {
  const isSystemUnit = isNativeUnitSystem(nativeUnit);

  return new Unit(
    nativeUnit.id,
    nativeUnit.name,
    nativeUnit.name_locale,
    nativeUnit.symbol,
    nativeUnit.unit_category_id,
    isSystemUnit,
  );
}

function createUnitCategoryFromNativeUnitCategory(nativeUnitCategory) {
  return new UnitCategory(
    nativeUnitCategory.id,
    nativeUnitCategory.name,
    nativeUnitCategory.name_locale,
  );
}

function createUnitContextFromNativeUnitContext(nativeUnitCategory) {
  return new UnitContext(
    nativeUnitCategory.id,
    nativeUnitCategory.name,
    nativeUnitCategory.name_locale,
    nativeUnitCategory.unit_category_id,
  );
}

function findUnitContextPrecision(nativeUnitContext, unitID) {
  return store.state.user.unitList.contextPrecision
    .find(contextPrecision => contextPrecision.context_id === nativeUnitContext.id
      && contextPrecision.unit_id === unitID);
}

function getUnitPrecision(nativeUnitContext, unitID) {
  const userContextPrecision = findUnitContextPrecision(nativeUnitContext, unitID);

  return typeof userContextPrecision !== 'undefined'
    ? userContextPrecision.precision
    : 0;
}

function findNativeUnitContextFromID(unitContextID) {
  return store.state.user.unitList.context.find(unitContext => unitContext.id === unitContextID);
}

function findNativeUnitContextFromName(unitContextName) {
  return store.state.user.unitList.context
    .find(unitContext => unitContext.name === unitContextName);
}

function getNativeUnitContextFromName(unitContextName) {
  const nativeUnitContext = findNativeUnitContextFromName(unitContextName);
  if (typeof nativeUnitContext === 'undefined') {
    throw new Error(i18n.t(
      'common.utils.unit.unitContextNameNotFound',
      { name: unitContextName },
    ));
  }
  return nativeUnitContext;
}

function findNativeUnitFromID(unitID) {
  return store.state.user.unitList.unit.find(unit => unit.id === unitID);
}

function findNativeUnitCategoryFromID(unitCategoryID) {
  return store.state.user.unitList.category
    .find(unitCategory => unitCategory.id === unitCategoryID);
}

function findNativeUnitListFromCategoryID(unitCategoryID) {
  return store.state.user.unitList.unit
    .filter(unit => unit.unit_category_id === unitCategoryID);
}

function findSystemNativeUnitFromContext(nativeUnitContext) {
  const nativeUnitList = findNativeUnitListFromCategoryID(nativeUnitContext.unit_category_id);

  const systemNativeUnit = nativeUnitList.find(unit => isNativeUnitSystem(unit));
  return systemNativeUnit;
}

function getUserUnitIDFromContext(nativeUnitContext) {
  const isUserOverrideUnit = typeof nativeUnitContext.user_unit === 'number';
  if (isUserOverrideUnit === true) {
    return nativeUnitContext.user_unit;
  }
  return nativeUnitContext.default_unit;
}

function roundValue(numberValue, decimalPrecision, base) {
  const validatedBase = typeof base === 'number' ? base : 10;
  const pow = validatedBase ** decimalPrecision;
  return Math.round(numberValue * pow) / pow;
}

function roundAndFormatValue(numberValue, decimalPrecision, base) {
  const roundedValue = roundValue(numberValue, decimalPrecision, base);
  const formattedValue = roundedValue.toLocaleString('fullwide', {
    maximumFractionDigits: decimalPrecision,
    minimumFractionDigits: decimalPrecision,
    useGrouping: false,
  });
  return formattedValue;
}

function UnitConverter(unitContextID) {
  function getNativeUnitContext() {
    const unitContext = findNativeUnitContextFromID(unitContextID);
    if (typeof unitContext === 'undefined') {
      throw new Error(i18n.t(
        'common.utils.unit.unitContextIDNotFound',
        { id: unitContextID },
      ));
    }
    return unitContext;
  }
  const nativeUnitContext = getNativeUnitContext();
  let unitContext;

  function getSystemNativeUnitFromContext() {
    const unit = findSystemNativeUnitFromContext(nativeUnitContext);
    if (typeof unit === 'undefined') {
      throw new Error(i18n.t(
        'common.utils.unit.systemUnitNotFound',
        { id: nativeUnitContext.id },
      ));
    }
    return unit;
  }
  const systemNativeUnit = getSystemNativeUnitFromContext();
  let systemUnit;
  let systemUnitPrecision;

  function getUserNativeUnitFromUnitContext() {
    const userUnitID = getUserUnitIDFromContext(nativeUnitContext);
    const unit = findNativeUnitFromID(userUnitID);
    if (typeof unit === 'undefined') {
      throw new Error(i18n.t(
        'common.utils.unit.userUnitNotFound',
        { id: userUnitID, unitContextID: nativeUnitContext.id },
      ));
    }
    return unit;
  }
  const userNativeUnit = getUserNativeUnitFromUnitContext();
  let userUnit;

  function getNativeUnitCategoryFromID() {
    const unitCategory = findNativeUnitCategoryFromID(nativeUnitContext.unit_category_id);
    if (typeof unitCategory === 'undefined') {
      throw new Error(i18n.t(
        'common.utils.unit.unitCategoryIDNotFound',
        { id: nativeUnitContext.unit_category_id },
      ));
    }
    return unitCategory;
  }
  const nativeUnitCategory = getNativeUnitCategoryFromID();
  let unitCategory;
  let userUnitPrecision;

  this.getSystemUnit = () => {
    if (typeof systemUnit === 'undefined') {
      systemUnit = createUnitFromNativeUnit(systemNativeUnit);
    }
    return systemUnit;
  };

  this.getUserUnit = () => {
    if (typeof userUnit === 'undefined') {
      userUnit = createUnitFromNativeUnit(userNativeUnit);
    }
    return userUnit;
  };

  this.getSystemUnitPrecision = () => {
    if (typeof systemUnitPrecision === 'undefined') {
      systemUnitPrecision = getUnitPrecision(nativeUnitContext, systemNativeUnit.id);
    }
    return systemUnitPrecision;
  };

  this.getUserUnitPrecision = () => {
    if (typeof userUnitPrecision === 'undefined') {
      userUnitPrecision = getUnitPrecision(nativeUnitContext, userNativeUnit.id);
    }
    return userUnitPrecision;
  };

  this.getUnitCategory = () => {
    if (typeof unitCategory === 'undefined') {
      unitCategory = createUnitCategoryFromNativeUnitCategory(nativeUnitCategory);
    }
    return unitCategory;
  };

  this.getUnitContext = () => {
    if (typeof unitContext === 'undefined') {
      unitContext = createUnitContextFromNativeUnitContext(nativeUnitContext);
    }
    return unitContext;
  };

  this.convertValueToUser = (dbValue) => {
    const result = ((userNativeUnit.scale * dbValue) + userNativeUnit.offset);
    return result;
  };

  this.convertValueToSystem = (userValue) => {
    const result = ((userValue - userNativeUnit.offset) / userNativeUnit.scale);
    return result;
  };

  this.formatValueToUser = (dbValue) => {
    const valueConverted = this.convertValueToUser(dbValue);
    const valueFormatted = roundAndFormatValue(
      valueConverted,
      this.getUserUnitPrecision(),
      10,
    );

    return valueFormatted;
  };

  this.formatValueToSystem = (userValue) => {
    const convertedValue = this.convertValueToSystem(userValue);
    const formattedValue = roundAndFormatValue(
      convertedValue,
      this.getSystemUnitPrecision(),
      10,
    );
    return formattedValue;
  };

  this.formatValueToUserWithUnitSymbol = (dbValue) => {
    const valueToStringWithPrecision = this.formatValueToUser(dbValue);

    return `${valueToStringWithPrecision} ${userNativeUnit.symbol}`;
  };

  this.formatValueToSystemWithUnitSymbol = (userValue) => {
    const valueToStringWithPrecision = this.formatValueToSystem(userValue);

    return `${valueToStringWithPrecision} ${systemNativeUnit.symbol}`;
  };
}

function createUnitConverterCacheKey(unitContextID) {
  return unitContextID.toString();
}

function addUnitConverterToCache(unitContextID) {
  const unitConverterCacheKey = createUnitConverterCacheKey(unitContextID);

  const unitConverter = new UnitConverter(unitContextID);

  unitConverterCache[unitConverterCacheKey] = unitConverter;
  return unitConverter;
}

function getUnitConverterFromCache(unitContextID) {
  const unitConverterCacheKey = createUnitConverterCacheKey(unitContextID);
  let unitConverter = unitConverterCache[unitConverterCacheKey];

  if (typeof unitConverter === 'undefined') {
    unitConverter = addUnitConverterToCache(unitContextID);
  }

  return unitConverter;
}

function getUnitConverterFromUnitContextID(unitContextID) {
  return getUnitConverterFromCache(unitContextID);
}

function getUnitConverterFromUnitContextName(unitContextName) {
  const unitContext = getNativeUnitContextFromName(unitContextName);

  return getUnitConverterFromCache(unitContext.id);
}

function getUnitList() {
  return store.state.user.unitList.unit
    .map(unit => createUnitFromNativeUnit(unit));
}

function getUnitFromID(unitID) {
  const nativeUnit = findNativeUnitFromID(unitID);
  if (typeof nativeUnit !== 'undefined') {
    return createUnitFromNativeUnit(nativeUnit);
  }
  throw new Error(i18n.t('common.utils.unit.systemUnitNotFound', { id: unitID }));
}

function getUnitCategoryList() {
  return store.state.user.unitList.category
    .map(unitCategory => createUnitCategoryFromNativeUnitCategory(unitCategory));
}

function getUnitCategoryFromID(unitCategoryID) {
  const nativeUnitCategory = findNativeUnitCategoryFromID(unitCategoryID);
  if (typeof nativeUnitCategory !== 'undefined') {
    return createUnitCategoryFromNativeUnitCategory(nativeUnitCategory);
  }
  throw new Error(i18n.t('common.utils.unit.unitCategoryIDNotFound', { id: unitCategoryID }));
}

function getUnitContextList() {
  return store.state.user.unitList.context
    .map(unitContext => createUnitContextFromNativeUnitContext(unitContext));
}

function getUnitContextFromID(unitContextID) {
  const nativeUnitContext = findNativeUnitContextFromID(unitContextID);
  if (typeof nativeUnitContext !== 'undefined') {
    return createUnitContextFromNativeUnitContext(nativeUnitContext);
  }
  throw new Error(i18n.t('common.utils.unit.unitContextIDNotFound', { id: unitContextID }));
}

function transformNativeUnitListToUnitList(nativeUnitList) {
  return nativeUnitList.map(unit => createUnitFromNativeUnit(unit));
}

function getUnitListFromContextID(unitContextID) {
  const nativeUnitContext = findNativeUnitContextFromID(unitContextID);
  if (typeof nativeUnitContext !== 'undefined') {
    const nativeUnitList = findNativeUnitListFromCategoryID(nativeUnitContext.unit_category_id);

    return transformNativeUnitListToUnitList(nativeUnitList);
  }
  return [];
}

export default {
  resetUnitConverterCache,
  getUnitConverterFromUnitContextID,
  getUnitConverterFromUnitContextName,
  getUnitList,
  getUnitFromID,
  getUnitCategoryList,
  getUnitCategoryFromID,
  getUnitContextList,
  getUnitContextFromID,
  getUnitListFromContextID,
  roundValue,
  roundAndFormatValue,
};
