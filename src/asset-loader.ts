export class AssetLoader {
	static instance: AssetLoader;
	private cache: Map<string, HTMLImageElement> = new Map();
	private constructor() {}
	public loadImage(src: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			if (this.cache.has(src)) {
				resolve(this.cache.get(src) as HTMLImageElement);
			}
			const image = new Image();
			image.src = src;
			image.onload = () => {
				this.cache.set(src, image);
				resolve(image);
			};
			image.onerror = reject;
		});
	}
	public static getInstance(): AssetLoader {
		if (!AssetLoader.instance) {
			AssetLoader.instance = new AssetLoader();
		}
		return AssetLoader.instance;
	}
}
