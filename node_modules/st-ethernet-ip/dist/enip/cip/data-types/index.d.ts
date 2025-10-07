declare const Types: {
    BOOL: number;
    SINT: number;
    INT: number;
    DINT: number;
    LINT: number;
    USINT: number;
    UINT: number;
    UDINT: number;
    REAL: number;
    LREAL: number;
    STIME: number;
    DATE: number;
    TIME_AND_DAY: number;
    DATE_AND_STRING: number;
    STRING: number;
    WORD: number;
    DWORD: number;
    BIT_STRING: number;
    LWORD: number;
    STRING2: number;
    FTIME: number;
    LTIME: number;
    ITIME: number;
    STRINGN: number;
    SHORT_STRING: number;
    TIME: number;
    EPATH: number;
    ENGUNIT: number;
    STRINGI: number;
    STRUCT: number;
};
declare const TypeSizes: {
    193: number;
    194: number;
    195: number;
    196: number;
    197: number;
    198: number;
    199: number;
    200: number;
    202: number;
};
/**
 * Checks if an Inputted Integer is a Valid Type Code (Vol1 Appendix C)
 *
 * @param num - Integer to be Tested
 * @returns true or false
 */
declare const isValidTypeCode: (num: number) => boolean;
/**
 * Retrieves Human Readable Version of an Inputted Type Code
 *
 * @param num - Type Code to Request Human Readable version
 * @returns Type Code String Interpretation
 */
declare const getTypeCodeString: (num: number) => string;
export { Types, isValidTypeCode, getTypeCodeString, TypeSizes };
