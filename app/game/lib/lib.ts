export function getTurnSpeed(roundTime: number): number {
    if(roundTime < 5000) return 10;
    else if(roundTime < 11000) return 9;
    else if(roundTime < 18000) return 8;
    else if(roundTime < 26000) return 7;
    else if(roundTime < 35000) return 6;
    else if(roundTime < 45000) return 5;
    else if(roundTime < 56000) return 4;
    else if(roundTime < 68000) return 3;
    else if(roundTime < 81000) return 2;
    else if(roundTime < 95000) return 1;
    else return 0;
}

