import { useDebouncedValue } from '@mantine/hooks';
import { useEffect, useState } from 'react';

export type CandidateType = 'search' | 'bookmark';

export interface Candidate {
    type: CandidateType;
    text: string;
    url: string;
    detail?: string;
}

export interface SearchOptions {
    debounceDelay: number;
}

export const useSearch = (
    text: string,
    options: SearchOptions = { debounceDelay: 150 },
): {
    candidates: Candidate[];
    selectedCandidate: Candidate | null;
    previous: () => void;
    next: () => void;
    run: (candidate?: Candidate | null) => void;
} => {
    const [debouncedText] = useDebouncedValue(text, options.debounceDelay);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const selectedCandidate = selectedIndex !== null ? candidates[selectedIndex] ?? null : null;

    useEffect(() => {
        setSelectedIndex(null);
        if (!debouncedText) {
            setCandidates([]);
            return;
        }

        getSearchCandidates(debouncedText).then(setCandidates);
    }, [debouncedText]);

    const previous = () => {
        if (!candidates.length) return;

        if (selectedIndex === null) {
            setSelectedIndex(candidates.length - 1);
        } else if (selectedIndex > 0) {
            setSelectedIndex(selectedIndex - 1);
        } else {
            setSelectedIndex(candidates.length - 1);
        }
    };

    const next = () => {
        if (!candidates.length) return;

        if (selectedIndex === null) {
            setSelectedIndex(0);
        } else if (selectedIndex < candidates.length - 1) {
            setSelectedIndex(selectedIndex + 1);
        } else {
            setSelectedIndex(0);
        }
    };

    const run = (candidate: Candidate | null = null) => {
        candidate ??= selectedCandidate;
        if (candidate) {
            navigate(candidate.url);
        } else {
            navigate(`https://www.google.co.jp/search?q=${encodeURIComponent(text)}`);
        }
    };

    return {
        candidates,
        selectedCandidate,
        previous,
        next,
        run,
    };
};

const getSearchCandidates = async (text: string): Promise<Candidate[]> =>
    (
        (await (
            await fetch(`https://hometab.live/api/complete?q=${encodeURIComponent(text)}`)
        ).json()) as string[]
    ).map((candidateText) => ({
        type: 'search',
        text: candidateText,
        url: `https://www.google.co.jp/search?q=${encodeURIComponent(candidateText)}`,
    }));

export const navigate = (url: string) => {
    location.href =
        url.startsWith('https://') || url.startsWith('http://') ? url : `https://${url}`;
};
