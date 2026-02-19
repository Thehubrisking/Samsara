
export interface RepoImage {
    id: number;
    src: string;
    tags: string[];
}
  
export interface SubBoard {
    name: string;
    images: RepoImage[];
}
  
export interface Avatar {
    name: string;
    thumbnail: string;
    subBoards: SubBoard[];
}

// Using Unsplash source for consistent, real imagery that supports CORS
const unsplash = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

export const repositoryData: Avatar[] = [
    {
        name: "Chani",
        thumbnail: unsplash("1531123897727-8f129e1688ce"), // Striking portrait
        subBoards: [
            {
                name: "Close Up",
                images: [
                    { id: 101, src: unsplash("1531123897727-8f129e1688ce"), tags: ["close-up", "portrait"] },
                    { id: 102, src: unsplash("1589156280126-0697533d8404"), tags: ["close-up", "smile"] }, 
                    { id: 103, src: unsplash("1566492031773-4f4e44671857"), tags: ["close-up", "serious"] },
                ]
            },
            {
                name: "Full Body",
                images: [
                    { id: 104, src: unsplash("1589156229687-496a31ad1d1f"), tags: ["full", "standing"] },
                    { id: 105, src: unsplash("1594744803329-e58b31de8bf5"), tags: ["full", "walking"] },
                    // Replaced broken Imgur link with working Unsplash fashion image
                    { id: 108, src: unsplash("1550614000-4b9519e4007c"), tags: ["full", "custom", "fashion"] },
                ]
            },
            {
                name: "Action",
                images: [
                    { id: 106, src: unsplash("1552196563-55fa026033ef"), tags: ["action", "fitness"] },
                    { id: 107, src: unsplash("1571019614242-c5c5dee9f50b"), tags: ["action", "pose", "model"] },
                    // Replaced Firebase URL with a reliable Unsplash action shot
                    { id: 109, src: unsplash("1616872763837-6d159691a53e"), tags: ["action", "custom", "dynamic"] },
                    { id: 110, src: "https://firebasestorage.googleapis.com/v0/b/samsara-130e5.firebasestorage.app/o/chan13.png?alt=media&token=87e6b785-6eed-4575-a435-3ef6ce384b77", tags: ["action", "custom", "firebase"] }, 
                ]
            }
        ]
    },
    {
        name: "Adel",
        thumbnail: unsplash("1517841905240-472988babdf9"), // Short hair/unique style
        subBoards: [
            {
                name: "Close Up",
                images: [
                    { id: 201, src: unsplash("1517841905240-472988babdf9"), tags: ["close-up", "glasses"] },
                    { id: 202, src: unsplash("1508214751196-bcfd4ca60f91"), tags: ["close-up", "hat"] },
                ]
            },
            {
                name: "Casual",
                images: [
                    { id: 203, src: unsplash("1487412720507-e7ab37603c6f"), tags: ["casual", "sitting"] },
                    { id: 204, src: unsplash("1529139574466-a3023d7d3f90"), tags: ["casual", "standing"] },
                ]
            }
        ]
    },
    {
        name: "Weyinimi",
        thumbnail: unsplash("1531746020798-e6953c6e8e04"), // Deep tones
        subBoards: [
            {
                name: "Portrait",
                images: [
                    { id: 301, src: unsplash("1531746020798-e6953c6e8e04"), tags: ["portrait", "studio"] },
                    { id: 302, src: unsplash("1523824921871-d6f1a15151f1"), tags: ["portrait", "outdoor"] },
                ]
            },
            {
                name: "Fashion",
                images: [
                    { id: 303, src: unsplash("1509631179647-0177331693ae"), tags: ["fashion", "runway"] },
                    { id: 304, src: unsplash("1483985988355-763728e1935b"), tags: ["fashion", "pose"] },
                    { id: 305, src: unsplash("1500917293891-ef795e70e1f6"), tags: ["fashion", "urban"] },
                ]
            }
        ]
    },
    {
        name: "Jedidiah",
        thumbnail: unsplash("1506794778202-cad84cf45f1d"), // Male model
        subBoards: [
            {
                name: "Headshot",
                images: [
                    { id: 401, src: unsplash("1506794778202-cad84cf45f1d"), tags: ["headshot", "corporate"] },
                    { id: 402, src: unsplash("1500648767791-00dcc994a43e"), tags: ["headshot", "creative"] },
                ]
            },
            {
                name: "Lifestyle",
                images: [
                    { id: 403, src: unsplash("1507003211169-0a1dd7228f2d"), tags: ["lifestyle", "coffee"] },
                    { id: 404, src: unsplash("1480429370139-e0132c086e2a"), tags: ["lifestyle", "park"] },
                ]
            }
        ]
    }
];
