import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {

    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        // UIApplicationSceneManifest loads Main.storyboard, whose initial
        // controller is CAPBridgeViewController, and assigns `window` before
        // this method. Create that same root only if UIKit did not.
        if window == nil {
            window = windowScene.windows.first
        }
        if window == nil {
            window = makeStoryboardWindow(for: windowScene)
        }
        window?.makeKeyAndVisible()
        (UIApplication.shared.delegate as? AppDelegate)?.window = window

        deliverLaunchActivitiesWhenBridgeAppears(connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        forward(urlContexts: URLContexts, userActivities: [])
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        forward(urlContexts: [], userActivities: [userActivity])
    }

    private func makeStoryboardWindow(for windowScene: UIWindowScene) -> UIWindow {
        let createdWindow = UIWindow(windowScene: windowScene)
        createdWindow.rootViewController = UIStoryboard(name: "Main", bundle: nil).instantiateInitialViewController()
        return createdWindow
    }

    /// Cold-start URL and universal-link events arrive here before Capacitor
    /// plugins are registered. Deliver them on the bridge's first appear, the
    /// same point Capacitor's scene proxy waits for.
    private func deliverLaunchActivitiesWhenBridgeAppears(_ connectionOptions: UIScene.ConnectionOptions) {
        let urlContexts = connectionOptions.urlContexts
        let userActivities = Array(connectionOptions.userActivities)
        guard !urlContexts.isEmpty || !userActivities.isEmpty else { return }

        var token: NSObjectProtocol?
        token = NotificationCenter.default.addObserver(
            forName: .capacitorViewDidAppear,
            object: nil,
            queue: .main
        ) { [weak self] _ in
            if let token {
                NotificationCenter.default.removeObserver(token)
            }
            self?.forward(urlContexts: urlContexts, userActivities: userActivities)
        }
    }

    private func forward(urlContexts: Set<UIOpenURLContext>, userActivities: [NSUserActivity]) {
        for context in urlContexts {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                open: context.url,
                options: Self.openURLOptions(from: context.options)
            )
        }
        for userActivity in userActivities {
            _ = ApplicationDelegateProxy.shared.application(
                UIApplication.shared,
                continue: userActivity,
                restorationHandler: { _ in }
            )
        }
    }

    private static func openURLOptions(from sceneOptions: UIScene.OpenURLOptions) -> [UIApplication.OpenURLOptionsKey: Any] {
        var options: [UIApplication.OpenURLOptionsKey: Any] = [:]
        if let sourceApplication = sceneOptions.sourceApplication {
            options[.sourceApplication] = sourceApplication
        }
        if let annotation = sceneOptions.annotation {
            options[.annotation] = annotation
        }
        options[.openInPlace] = sceneOptions.openInPlace
        return options
    }

}
