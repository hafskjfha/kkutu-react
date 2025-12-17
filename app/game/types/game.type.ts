export type GameSetting = {
    lang: 'ko' | 'en';
    mode: 'normal' | 'mission';
    hintMode: 'special' | 'auto';
    notAgainSameChar: boolean;
    roundTime: number; // ms
    wantStartChar: Set<string>;
}