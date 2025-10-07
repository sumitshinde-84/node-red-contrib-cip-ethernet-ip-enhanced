export default class SerialNumber {
    serialBits: number;
    serialBytes: number;
    _value: number;
    _half: number;
    _modulo: number;
    _maxAdd: number;
    number: number;
    /**
    * SerialNumber constructor
    *
    * @param value - The little endian encoded number
    * @param size - The size of the serial number space in bits
    **/
    constructor(value: number, size: number);
    /**
    * Equality comparison with another SerialNumber
    *
    * @param that - SerialNumber to make comparison with
    * @return comparison
    **/
    eq(that: SerialNumber): boolean;
    /**
    * Not equal comparison with another SerialNumber
    *
    * @param that - SerialNumber to make comparison with
    * @return {comparison
    **/
    ne(that: SerialNumber): boolean;
    /**
    * Less than comparison with another SerialNumber
    *
    * @param that - SerialNumber to make comparison with
    * @return comparison
    **/
    lt(that: SerialNumber): boolean;
    /**
    * Greater than comparison with another SerialNumber
    *
    * @param that - SerialNumber to make comparison with
    * @return comparison
    **/
    gt(that: SerialNumber): boolean;
    /**
    * Less than or equal comparison with another SerialNumber
    *
    * @param that - SerialNumber to make comparison with
    * @return comparison
    **/
    le(that: SerialNumber): boolean;
    /**
    * Greater than or equal comparison with another SerialNumber
    *
    * @param that - SerialNumber to make comparison with
    * @return comparison
    **/
    ge(that: SerialNumber): boolean;
    /**
    * Addition operation on two SerialNumbers
    *
    * @param that - Add this SerialNumber to the receiver
    * @return value of addition
    **/
    add(that: SerialNumber): number;
    /**
    * Return the number
    *
    * @param options - Optional {radix: 10, string: true, encoding:}
    * @returns number
    **/
    getNumber(options: any): string | number;
    /**
    * Return the serial space
    *
    * @params bytes - Return serial space as bytes instead of bits
    * @return bits|bytes as integer
    **/
    getSpace(bytes: boolean): number;
    toString(): string;
    /**
    * Test if addition op valid for two SerialNumbers
    *
    * @param that - Test if addition possible with receiver
    * @return result of test
    **/
    additionOpValid(that: SerialNumber): boolean;
}
