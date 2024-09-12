export function getPythonVersions() {
    const [versions, setVersions] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                const response = await fetch(
                    "https://www.python.org/ftp/python/"
                );
                if (!response.ok) {
                    throw new Error("Failed to fetch Python versions");
                }
                const data = await response.text();
                const soup = new DOMParser().parseFromString(data, "text/html");
                const links = soup.querySelectorAll("a");

                const pythonVersions = [];
                for (const link of links) {
                    if (link.textContent.startsWith("python-")) {
                        const version = link.textContent.split("-")[1];
                        if (version.startsWith("3.")) {
                            pythonVersions.push(version);
                        }
                    }
                }

                setVersions(pythonVersions);
                setLoading(false);
            } catch (error) {
                setError(error.message);
                setLoading(false);
            }
        };

        fetchVersions();
    }, []);

    return { versions, error, loading };
}
