type Args = {
    text: string;
    ignoreTextList: string[];
};

// 改行を無視してテキストを比較
export const isTextIgnored = ({ text, ignoreTextList }: Args): boolean => {
    const normalizedText = text.replace(/\s+/g, "");
    return ignoreTextList.some((ignoreText) => normalizedText === ignoreText.replace(/\s+/g, ""));
};
