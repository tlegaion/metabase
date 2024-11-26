import moment from "moment-timezone"; // eslint-disable-line no-restricted-imports -- deprecated usage

import * as ML from "cljs/metabase.lib.js";
import type { CardId, DatasetColumn, TemporalUnit } from "metabase-types/api";

import {
  isBoolean,
  isCoordinate,
  isDateOrDateTime,
  isNumeric,
  isStringOrStringLike,
  isTime,
} from "./column_types";
import {
  BOOLEAN_FILTER_OPERATORS,
  COORDINATE_FILTER_OPERATORS,
  DEFAULT_FILTER_OPERATORS,
  EXCLUDE_DATE_BUCKETS,
  EXCLUDE_DATE_FILTER_OPERATORS,
  NUMBER_FILTER_OPERATORS,
  RELATIVE_DATE_BUCKETS,
  SPECIFIC_DATE_FILTER_OPERATORS,
  STRING_FILTER_OPERATORS,
  STRING_FILTER_OPERATORS_WITH_OPTIONS,
  TIME_FILTER_OPERATORS,
} from "./constants";
import { expressionClause, expressionParts } from "./expression";
import { isColumnMetadata } from "./internal";
import { displayInfo } from "./metadata";
import { removeClause } from "./query";
import {
  availableTemporalBuckets,
  temporalBucket,
  withTemporalBucket,
} from "./temporal_bucket";
import type {
  BooleanFilterOperatorName,
  BooleanFilterParts,
  Bucket,
  ColumnMetadata,
  CoordinateFilterOperatorName,
  CoordinateFilterParts,
  DefaultFilterOperatorName,
  DefaultFilterParts,
  ExcludeDateBucketName,
  ExcludeDateFilterOperatorName,
  ExcludeDateFilterParts,
  ExpressionArg,
  ExpressionClause,
  ExpressionOperatorName,
  ExpressionOptions,
  ExpressionParts,
  FilterClause,
  FilterOperator,
  FilterParts,
  NumberFilterOperatorName,
  NumberFilterParts,
  Query,
  RelativeDateBucketName,
  RelativeDateFilterParts,
  SegmentMetadata,
  SpecificDateFilterOperatorName,
  SpecificDateFilterParts,
  StringFilterOperatorName,
  StringFilterOptions,
  StringFilterParts,
  TimeFilterOperatorName,
  TimeFilterParts,
} from "./types";

export function filterableColumns(
  query: Query,
  stageIndex: number,
): ColumnMetadata[] {
  return ML.filterable_columns(query, stageIndex);
}

export function filterableColumnOperators(
  column: ColumnMetadata,
): FilterOperator[] {
  return ML.filterable_column_operators(column);
}

export function filter(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause | ExpressionClause | SegmentMetadata,
): Query {
  return ML.filter(query, stageIndex, filterClause);
}

export function filters(query: Query, stageIndex: number): FilterClause[] {
  return ML.filters(query, stageIndex);
}

export function removeFilters(query: Query, stageIndex: number): Query {
  return filters(query, stageIndex).reduce(
    (newQuery, filter) => removeClause(newQuery, stageIndex, filter),
    query,
  );
}

export function filterArgsDisplayName(
  query: Query,
  stageIndex: number,
  clause: FilterClause,
): string {
  return ML.filter_args_display_name(query, stageIndex, clause);
}

export function stringFilterClause({
  operator,
  column,
  values,
  options,
}: StringFilterParts): ExpressionClause {
  return expressionClause(
    operator,
    [column, ...values],
    getStringFilterOptions(operator, options),
  );
}

export function stringFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): StringFilterParts | null {
  const { operator, options, args } = expressionParts(
    query,
    stageIndex,
    filterClause,
  );
  if (!isStringOperator(operator) || args.length < 1) {
    return null;
  }

  const [column, ...values] = args;
  if (
    !isColumnMetadata(column) ||
    !isStringOrStringLike(column) ||
    !isStringLiteralArray(values)
  ) {
    return null;
  }

  return {
    operator,
    column,
    values,
    options: getStringFilterOptions(operator, options),
  };
}

export function numberFilterClause({
  operator,
  column,
  values,
}: NumberFilterParts): ExpressionClause {
  return expressionClause(operator, [column, ...values]);
}

export function numberFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): NumberFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isNumberOperator(operator) || args.length < 1) {
    return null;
  }

  const [column, ...values] = args;
  if (
    !isColumnMetadata(column) ||
    !isNumeric(column) ||
    isCoordinate(column) || // coordinates have their own filterParts
    !isNumberLiteralArray(values)
  ) {
    return null;
  }

  return {
    operator,
    column,
    values,
  };
}

export function coordinateFilterClause({
  operator,
  column,
  longitudeColumn,
  values,
}: CoordinateFilterParts): ExpressionClause {
  const args =
    operator === "inside"
      ? [column, longitudeColumn ?? column, ...values]
      : [column, ...values];
  return expressionClause(operator, args);
}

export function coordinateFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): CoordinateFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isCoordinateOperator(operator) || args.length < 1) {
    return null;
  }

  const [column, ...otherArgs] = args;
  if (
    !isColumnMetadata(column) ||
    !isNumeric(column) ||
    !isCoordinate(column)
  ) {
    return null;
  }

  if (operator === "inside") {
    const [longitudeColumn, ...values] = otherArgs;
    if (isColumnMetadata(longitudeColumn) && isNumberLiteralArray(values)) {
      return { operator, column, longitudeColumn, values };
    }
  } else {
    const values = otherArgs;
    if (isNumberLiteralArray(values)) {
      return { operator, column, values };
    }
  }

  return null;
}

export function booleanFilterClause({
  operator,
  column,
  values,
}: BooleanFilterParts): ExpressionClause {
  return expressionClause(operator, [column, ...values]);
}

export function booleanFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): BooleanFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isBooleanOperator(operator) || args.length < 1) {
    return null;
  }

  const [column, ...values] = args;
  if (
    !isColumnMetadata(column) ||
    !isBoolean(column) ||
    !isBooleanLiteralArray(values)
  ) {
    return null;
  }

  return {
    operator,
    column,
    values,
  };
}

export function specificDateFilterClause(
  query: Query,
  stageIndex: number,
  { operator, column, values, hasTime }: SpecificDateFilterParts,
): ExpressionClause {
  const serializedValues = hasTime
    ? values.map(value => serializeDateTime(value))
    : values.map(value => serializeDate(value));

  const minuteBucket = hasTime
    ? findTemporalBucket(query, stageIndex, column, "minute")
    : undefined;
  const columnWithOrWithoutBucket =
    hasTime && minuteBucket
      ? withTemporalBucket(column, minuteBucket)
      : withTemporalBucket(column, null);

  return expressionClause(operator, [
    columnWithOrWithoutBucket,
    ...serializedValues,
  ]);
}

export function specificDateFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): SpecificDateFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isSpecificDateOperator(operator) || args.length < 1) {
    return null;
  }

  const [column, ...serializedValues] = args;
  if (
    !isColumnMetadata(column) ||
    !isDateOrDateTime(column) ||
    !isStringLiteralArray(serializedValues)
  ) {
    return null;
  }

  const dateValues = serializedValues.map(deserializeDate);
  if (isDefinedArray(dateValues)) {
    return {
      operator,
      column,
      values: dateValues,
      hasTime: false,
    };
  }

  const dateTimeValues = serializedValues.map(deserializeDateTime);
  if (isDefinedArray(dateTimeValues)) {
    return {
      operator,
      column,
      values: dateTimeValues,
      hasTime: true,
    };
  }

  return null;
}

export function relativeDateFilterClause({
  column,
  value,
  bucket,
  offsetValue,
  offsetBucket,
  options,
}: RelativeDateFilterParts): ExpressionClause {
  const columnWithoutBucket = withTemporalBucket(column, null);

  if (offsetValue == null || offsetBucket == null) {
    return expressionClause(
      "time-interval",
      [columnWithoutBucket, value, bucket],
      options,
    );
  }

  return expressionClause("relative-time-interval", [
    columnWithoutBucket,
    value,
    bucket,
    offsetValue,
    offsetBucket,
  ]);
}

export function relativeDateFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): RelativeDateFilterParts | null {
  const filterParts = expressionParts(query, stageIndex, filterClause);
  return (
    relativeDateFilterPartsWithoutOffset(filterParts) ??
    relativeDateFilterPartsWithOffset(filterParts) ??
    relativeDateFilterPartsRelativeTimeInterval(filterParts)
  );
}

export function excludeDateFilterClause({
  operator,
  column,
  values,
  bucket: bucketName,
}: ExcludeDateFilterParts): ExpressionClause {
  if (!bucketName) {
    const columnWithoutBucket = withTemporalBucket(column, null);
    return expressionClause(operator, [columnWithoutBucket]);
  }

  const columnWithoutBucket = withTemporalBucket(column, null);
  switch (bucketName) {
    case "hour-of-day":
      return expressionClause("!=", [
        expressionClause("get-hour", [columnWithoutBucket]),
        ...values,
      ]);
    case "day-of-week":
      return expressionClause("!=", [
        expressionClause("get-day-of-week", [columnWithoutBucket, "iso"]),
        ...values,
      ]);
    case "month-of-year":
      return expressionClause("!=", [
        expressionClause("get-month", [columnWithoutBucket]),
        ...values,
      ]);
    case "quarter-of-year":
      return expressionClause("!=", [
        expressionClause("get-quarter", [columnWithoutBucket]),
        ...values,
      ]);
  }
}

export function excludeDateFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): ExcludeDateFilterParts | null {
  return (
    expressionExcludeDateFilterParts(query, stageIndex, filterClause) ??
    legacyTemporalBucketExcludeDateFilterParts(query, stageIndex, filterClause)
  );
}

function expressionExcludeDateFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): ExcludeDateFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isExcludeDateOperator(operator) || args.length < 1) {
    return null;
  }

  if (operator === "is-null" || operator === "not-null") {
    const [column] = args;
    if (!isColumnMetadata(column) || !isDateOrDateTime(column)) {
      return null;
    }

    return { operator, column, values: [], bucket: null };
  } else {
    const [expression, ...values] = args;
    if (!isExpression(expression) || !isNumberLiteralArray(values)) {
      return null;
    }

    const { operator: expressionOperator, args: expressionArgs } = expression;
    if (expressionArgs.length < 1) {
      return null;
    }

    const [column] = expressionArgs;
    if (!isColumnMetadata(column) || !isDateOrDateTime(column)) {
      return null;
    }

    switch (expressionOperator) {
      case "get-hour":
        if (expressionArgs.length === 1) {
          return { operator, column, values, bucket: "hour-of-day" };
        } else {
          return null;
        }
      case "get-day-of-week":
        if (expressionArgs.length === 2 && expressionArgs[1] === "iso") {
          return { operator, column, values, bucket: "day-of-week" };
        } else {
          return null;
        }
      case "get-month":
        if (expressionArgs.length === 1) {
          return { operator, column, values, bucket: "month-of-year" };
        } else {
          return null;
        }
      case "get-quarter":
        if (expressionArgs.length === 1) {
          return { operator, column, values, bucket: "quarter-of-year" };
        } else {
          return null;
        }
      default:
        return null;
    }
  }
}

function legacyTemporalBucketExcludeDateFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): ExcludeDateFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isExcludeDateOperator(operator) || args.length < 1) {
    return null;
  }

  const [column, ...serializedValues] = args;
  if (!isColumnMetadata(column)) {
    return null;
  }

  const columnWithoutBucket = withTemporalBucket(column, null);
  if (!isDateOrDateTime(columnWithoutBucket)) {
    return null;
  }

  const bucket = temporalBucket(column);
  if (!bucket) {
    return serializedValues.length === 0
      ? { column: columnWithoutBucket, operator, bucket, values: [] }
      : null;
  }

  const bucketInfo = displayInfo(query, stageIndex, bucket);
  if (!isExcludeDateBucket(bucketInfo.shortName)) {
    return null;
  }

  const values = serializedValues.map(value =>
    deserializeExcludeDatePart(value, bucketInfo.shortName),
  );
  if (!isDefinedArray(values)) {
    return null;
  }

  return {
    column: columnWithoutBucket,
    operator,
    bucket: bucketInfo.shortName,
    values,
  };
}

export function timeFilterClause({
  operator,
  column,
  values,
}: TimeFilterParts): ExpressionClause {
  const serializedValues = values.map(value => serializeTime(value));
  return expressionClause(operator, [column, ...serializedValues]);
}

export function timeFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): TimeFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isTimeOperator(operator) || args.length < 1) {
    return null;
  }

  const [column, ...serializedValues] = args;
  if (
    !isColumnMetadata(column) ||
    !isTime(column) ||
    !isStringLiteralArray(serializedValues)
  ) {
    return null;
  }

  const values = serializedValues.map(value => deserializeTime(value));
  if (!isDefinedArray(values)) {
    return null;
  }

  return {
    operator,
    column,
    values,
  };
}

export function defaultFilterClause({
  operator,
  column,
}: DefaultFilterParts): ExpressionClause {
  return expressionClause(operator, [column]);
}

export function defaultFilterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): DefaultFilterParts | null {
  const { operator, args } = expressionParts(query, stageIndex, filterClause);
  if (!isDefaultOperator(operator) || args.length !== 1) {
    return null;
  }

  const [column] = args;
  if (
    !isColumnMetadata(column) ||
    // these types have their own filterParts
    isStringOrStringLike(column) ||
    isNumeric(column) ||
    isBoolean(column) ||
    isDateOrDateTime(column) ||
    isTime(column)
  ) {
    return null;
  }

  return {
    operator,
    column,
  };
}

export function filterParts(
  query: Query,
  stageIndex: number,
  filterClause: FilterClause,
): FilterParts | null {
  return (
    stringFilterParts(query, stageIndex, filterClause) ??
    numberFilterParts(query, stageIndex, filterClause) ??
    coordinateFilterParts(query, stageIndex, filterClause) ??
    booleanFilterParts(query, stageIndex, filterClause) ??
    specificDateFilterParts(query, stageIndex, filterClause) ??
    relativeDateFilterParts(query, stageIndex, filterClause) ??
    excludeDateFilterParts(query, stageIndex, filterClause) ??
    timeFilterParts(query, stageIndex, filterClause) ??
    defaultFilterParts(query, stageIndex, filterClause)
  );
}

export function isStandardFilter(
  query: Query,
  stageIndex: number,
  filter: FilterClause,
) {
  return filterParts(query, stageIndex, filter) != null;
}

export function isSegmentFilter(
  query: Query,
  stageIndex: number,
  filter: FilterClause,
) {
  const { operator } = expressionParts(query, stageIndex, filter);
  return operator === "segment";
}

function findTemporalBucket(
  query: Query,
  stageIndex: number,
  column: ColumnMetadata,
  temporalUnit: TemporalUnit,
): Bucket | undefined {
  return availableTemporalBuckets(query, stageIndex, column).find(bucket => {
    const bucketInfo = displayInfo(query, stageIndex, bucket);
    return bucketInfo.shortName === temporalUnit;
  });
}

function isExpression(arg: unknown): arg is ExpressionParts {
  return arg != null && typeof arg === "object";
}

function isDefined<T>(arg: T | undefined | null): arg is T {
  return arg != null;
}

function isDefinedArray<T>(arg: (T | undefined | null)[]): arg is T[] {
  return arg.every(isDefined);
}

function isStringLiteral(arg: unknown): arg is string {
  return typeof arg === "string";
}

function isStringLiteralArray(arg: unknown): arg is string[] {
  return Array.isArray(arg) && arg.every(isStringLiteral);
}

function isNumberLiteral(arg: unknown): arg is number {
  return typeof arg === "number";
}

function isNumberOrCurrentLiteral(arg: unknown): arg is number | "current" {
  return isNumberLiteral(arg) || arg === "current";
}

function isNumberLiteralArray(arg: unknown): arg is number[] {
  return Array.isArray(arg) && arg.every(isNumberLiteral);
}

function isBooleanLiteral(arg: unknown): arg is boolean {
  return typeof arg === "boolean";
}

function isBooleanLiteralArray(arg: unknown): arg is boolean[] {
  return Array.isArray(arg) && arg.every(isBooleanLiteral);
}

function isStringOperator(
  operator: ExpressionOperatorName,
): operator is StringFilterOperatorName {
  const operators: ReadonlyArray<string> = STRING_FILTER_OPERATORS;
  return operators.includes(operator);
}

function getStringFilterOptions(
  operator: ExpressionOperatorName,
  options: ExpressionOptions,
): StringFilterOptions {
  const operators: ReadonlyArray<string> = STRING_FILTER_OPERATORS_WITH_OPTIONS;
  const supportsOptions = operators.includes(operator);
  return supportsOptions ? { "case-sensitive": false, ...options } : {};
}

function isNumberOperator(
  operator: ExpressionOperatorName,
): operator is NumberFilterOperatorName {
  const operators: ReadonlyArray<string> = NUMBER_FILTER_OPERATORS;
  return operators.includes(operator);
}

function isCoordinateOperator(
  operator: ExpressionOperatorName,
): operator is CoordinateFilterOperatorName {
  const operators: ReadonlyArray<string> = COORDINATE_FILTER_OPERATORS;
  return operators.includes(operator);
}

function isBooleanOperator(
  operator: ExpressionOperatorName,
): operator is BooleanFilterOperatorName {
  const operators: ReadonlyArray<string> = BOOLEAN_FILTER_OPERATORS;
  return operators.includes(operator);
}

function isSpecificDateOperator(
  operator: ExpressionOperatorName,
): operator is SpecificDateFilterOperatorName {
  const operators: ReadonlyArray<string> = SPECIFIC_DATE_FILTER_OPERATORS;
  return operators.includes(operator);
}

function isExcludeDateOperator(
  operator: ExpressionOperatorName,
): operator is ExcludeDateFilterOperatorName {
  const operators: ReadonlyArray<string> = EXCLUDE_DATE_FILTER_OPERATORS;
  return operators.includes(operator);
}

function isTimeOperator(
  operator: ExpressionOperatorName,
): operator is TimeFilterOperatorName {
  const operators: ReadonlyArray<string> = TIME_FILTER_OPERATORS;
  return operators.includes(operator);
}

function isDefaultOperator(
  operator: ExpressionOperatorName,
): operator is DefaultFilterOperatorName {
  const operators: ReadonlyArray<string> = DEFAULT_FILTER_OPERATORS;
  return operators.includes(operator);
}

function isRelativeDateBucket(
  bucketName: string,
): bucketName is RelativeDateBucketName {
  const buckets: ReadonlyArray<string> = RELATIVE_DATE_BUCKETS;
  return buckets.includes(bucketName);
}

function isExcludeDateBucket(
  bucketName: string,
): bucketName is ExcludeDateBucketName {
  const buckets: ReadonlyArray<string> = EXCLUDE_DATE_BUCKETS;
  return buckets.includes(bucketName);
}

const DATE_FORMAT = "YYYY-MM-DD";
const TIME_FORMAT = "HH:mm:ss";
const TIME_FORMATS = ["HH:mm:ss.SSS[Z]", "HH:mm:ss.SSS", "HH:mm:ss", "HH:mm"];
const TIME_FORMAT_MS = "HH:mm:ss.SSS";
const DATE_TIME_FORMAT = `${DATE_FORMAT}T${TIME_FORMAT}`;

function serializeDate(date: Date): string {
  return moment(date).format(DATE_FORMAT);
}

function serializeDateTime(date: Date): string {
  return moment(date).format(DATE_TIME_FORMAT);
}

function deserializeDate(value: string): Date | null {
  const date = moment(value, DATE_FORMAT, true);
  if (!date.isValid()) {
    return null;
  }

  return date.toDate();
}

function deserializeDateTime(value: string): Date | null {
  const dateTime = moment.parseZone(value, moment.ISO_8601, true);
  if (!dateTime.isValid()) {
    return null;
  }

  return dateTime.local(true).toDate();
}

function serializeTime(value: Date): string {
  return moment(value).format(TIME_FORMAT_MS);
}

function deserializeTime(value: string): Date | null {
  const time = moment(value, TIME_FORMATS, true);
  if (!time.isValid()) {
    return null;
  }

  return time.toDate();
}

function relativeDateFilterPartsWithoutOffset({
  operator,
  args,
  options,
}: ExpressionParts): RelativeDateFilterParts | null {
  if (operator !== "time-interval" || args.length !== 3) {
    return null;
  }

  const [column, value, bucket] = args;
  if (
    !isColumnMetadata(column) ||
    !isDateOrDateTime(column) ||
    !isNumberOrCurrentLiteral(value) ||
    !isStringLiteral(bucket) ||
    !isRelativeDateBucket(bucket)
  ) {
    return null;
  }

  return {
    column,
    value,
    bucket,
    offsetValue: null,
    offsetBucket: null,
    options,
  };
}

function relativeDateFilterPartsWithOffset({
  operator,
  args,
  options,
}: ExpressionParts): RelativeDateFilterParts | null {
  if (operator !== "between" || args.length !== 3) {
    return null;
  }

  const [offsetParts, startParts, endParts] = args;
  if (
    !isExpression(offsetParts) ||
    !isExpression(startParts) ||
    !isExpression(endParts) ||
    offsetParts.operator !== "+" ||
    offsetParts.args.length !== 2 ||
    startParts.operator !== "relative-datetime" ||
    startParts.args.length !== 2 ||
    endParts.operator !== "relative-datetime" ||
    endParts.args.length !== 2
  ) {
    return null;
  }

  const [column, intervalParts] = offsetParts.args;
  if (
    !isColumnMetadata(column) ||
    !isDateOrDateTime(column) ||
    !isExpression(intervalParts) ||
    intervalParts.operator !== "interval"
  ) {
    return null;
  }

  const [offsetValue, offsetBucket] = intervalParts.args;
  if (
    !isNumberLiteral(offsetValue) ||
    !isStringLiteral(offsetBucket) ||
    !isRelativeDateBucket(offsetBucket)
  ) {
    return null;
  }

  const [startValue, startBucket] = startParts.args;
  const [endValue, endBucket] = endParts.args;
  if (
    !isNumberLiteral(startValue) ||
    !isStringLiteral(startBucket) ||
    !isRelativeDateBucket(startBucket) ||
    !isNumberLiteral(endValue) ||
    !isStringLiteral(endBucket) ||
    !isRelativeDateBucket(endBucket) ||
    startBucket !== endBucket ||
    (startValue !== 0 && endValue !== 0)
  ) {
    return null;
  }

  return {
    column,
    value: startValue < 0 ? startValue : endValue,
    bucket: startBucket,
    offsetValue: offsetValue * -1,
    offsetBucket,
    options,
  };
}

function relativeDateFilterPartsRelativeTimeInterval({
  operator,
  args,
  options,
}: ExpressionParts): RelativeDateFilterParts | null {
  if (operator !== "relative-time-interval" || args.length !== 5) {
    return null;
  }

  const [column, value, bucket, offsetValue, offsetBucket] = args;

  if (!isColumnMetadata(column) || !isDateOrDateTime(column)) {
    return null;
  }

  if (
    !isNumberLiteral(value) ||
    !isStringLiteral(bucket) ||
    !isRelativeDateBucket(bucket)
  ) {
    return null;
  }

  if (
    !isNumberLiteral(offsetValue) ||
    !isStringLiteral(offsetBucket) ||
    !isRelativeDateBucket(offsetBucket)
  ) {
    return null;
  }

  return {
    column,
    bucket,
    value,
    offsetBucket,
    offsetValue,
    options,
  };
}

function deserializeExcludeDatePart(
  value: ExpressionArg | ExpressionParts,
  temporalUnit: TemporalUnit,
): number | null {
  if (temporalUnit === "hour-of-day") {
    return isNumberLiteral(value) ? value : null;
  }

  if (!isStringLiteral(value)) {
    return null;
  }

  const date = moment(value, DATE_FORMAT, true);
  if (!date.isValid()) {
    return null;
  }

  switch (temporalUnit) {
    case "day-of-week":
      return date.isoWeekday();
    case "month-of-year":
      return date.month() + 1;
    case "quarter-of-year":
      return date.quarter();
    default:
      return null;
  }
}

type UpdateLatLonFilterBounds = {
  north: number;
  west: number;
  east: number;
  south: number;
};

/**
 * Add or update a filter against latitude and longitude columns. Used to power the 'brush filter' for map
   visualizations.
 */
export function updateLatLonFilter(
  query: Query,
  stageIndex: number,
  latitudeColumn: DatasetColumn,
  longitudeColumn: DatasetColumn,
  cardId: CardId | undefined,
  bounds: UpdateLatLonFilterBounds,
): Query {
  return ML.update_lat_lon_filter(
    query,
    stageIndex,
    latitudeColumn,
    longitudeColumn,
    cardId,
    bounds,
  );
}

/**
 * Add or update a filter against a numeric column. Used to power the 'brush filter'.
 */
export function updateNumericFilter(
  query: Query,
  stageIndex: number,
  numericColumn: DatasetColumn,
  cardId: CardId | undefined,
  start: number,
  end: number,
): Query {
  return ML.update_numeric_filter(
    query,
    stageIndex,
    numericColumn,
    cardId,
    start,
    end,
  );
}

/**
 * Add or update a filter against a temporal column. Used to power the 'brush filter' for a timeseries visualization.
 * `start` and `end` should be ISO-8601 formatted strings.
 */
export function updateTemporalFilter(
  query: Query,
  stageIndex: number,
  temporalColumn: DatasetColumn,
  cardId: CardId | undefined,
  start: string | Date,
  end: string | Date,
): Query {
  return ML.update_temporal_filter(
    query,
    stageIndex,
    temporalColumn,
    cardId,
    start,
    end,
  );
}
