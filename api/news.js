export default async function handler(req, res) {
  try {
    const response = await fetch("https://content.guardianapis.com/search?api-key=test&page-size=10&show-fields=trailText&order-by=newest");
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Could not load news" });
  }
}
